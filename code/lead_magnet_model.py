#!/usr/bin/env python3
"""One OpenAI Responses call with its cost calculated, shared by the modules that need it.

    python3 code/lead_magnet_model.py

With no arguments it reports whether the key is readable. It never calls the API
itself; lead_magnet_ai.py and lead_magnet_reviews.py do the calling.

Cost: gpt-5-mini list prices, 0.25 USD per million input tokens, 2.00 USD per
million output tokens, and 0.01 USD per web search. The API returns tokens, not
dollars, so every amount recorded here is calculated, not reported.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request

try:
    from lead_magnet_instrument import count_call, record_cost
    from lead_magnet_workspace import workspace_root
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from lead_magnet_instrument import count_call, record_cost
    from lead_magnet_workspace import workspace_root

URL = "https://api.openai.com/v1/responses"
MODEL = "gpt-5-mini"
KEY_NAME = "OPENAI_API_KEY"
USD_PER_M_INPUT = 0.25
USD_PER_M_OUTPUT = 2.00
USD_PER_WEB_SEARCH = 0.01
MISSING_KEY = (f"no {KEY_NAME}; put it in .env or the environment "
               "(create one at https://platform.openai.com/api-keys)")


class ModelUnavailable(RuntimeError):
    """No key, or the API did not answer.

    Every caller catches this and writes "not measured" instead of a number. An
    absent model is missing evidence, never a finding of zero.
    """


def key() -> str:
    """The key from the environment first, then from .env in this repository.

    Reading os.environ alone would leave a key that sits in .env unused: the run
    would go out unauthenticated and the failure would look like a quota problem
    rather than a missing key.
    """
    value = os.environ.get(KEY_NAME, "").strip()
    if value:
        return value
    try:
        path = workspace_root() / ".env"
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                if line.strip().startswith(f"{KEY_NAME}="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except OSError:
        return ""
    return ""


def _http_detail(error: urllib.error.HTTPError) -> str:
    try:
        return " ".join((error.read() or b"").decode("utf-8", "replace").split())[:200]
    except OSError:
        return error.reason if isinstance(error.reason, str) else ""


def call(body: dict, endpoint: str, *, timeout: int = 120) -> dict:
    """One Responses call. Raises ModelUnavailable rather than letting a run die."""
    api_key = key()
    if not api_key:
        raise ModelUnavailable(MISSING_KEY)
    count_call(endpoint)
    request = urllib.request.Request(
        URL,
        data=json.dumps({"model": MODEL, **body}).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        raise ModelUnavailable(
            f"OpenAI answered HTTP {error.code}: {_http_detail(error) or 'no detail'}") from error
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as error:
        raise ModelUnavailable(f"the OpenAI Responses API did not answer: {error}") from error
    usage = data.get("usage") or {}
    searches = sum(1 for item in data.get("output") or [] if item.get("type") == "web_search_call")
    record_cost(endpoint, cost_usd(usage, searches))
    return data


def cost_usd(usage: dict, searches: int) -> float:
    return round(
        (usage.get("input_tokens") or 0) / 1e6 * USD_PER_M_INPUT
        + (usage.get("output_tokens") or 0) / 1e6 * USD_PER_M_OUTPUT
        + searches * USD_PER_WEB_SEARCH,
        5,
    )


def text_of(data: dict) -> str:
    return "".join(
        part.get("text", "")
        for item in data.get("output") or [] if item.get("type") == "message"
        for part in item.get("content") or []
    )


def citations_of(data: dict) -> list[str]:
    """Every page the answer rests on: inline citations plus the search's own sources.

    A JSON-only answer carries no inline citations (measured 23 September 2026),
    so the sources need `include: ["web_search_call.action.sources"]` on the
    request.
    """
    inline = [
        str(note.get("url"))
        for item in data.get("output") or [] if item.get("type") == "message"
        for part in item.get("content") or []
        for note in part.get("annotations") or []
        if note.get("type") == "url_citation" and note.get("url")
    ]
    searched = [
        str(source.get("url"))
        for item in data.get("output") or [] if item.get("type") == "web_search_call"
        for source in (item.get("action") or {}).get("sources") or []
        if source.get("url")
    ]
    return inline + searched


def same_page(a: str, b: str) -> bool:
    """Host and path, ignoring scheme, www, query, fragment and a trailing slash."""
    def norm(url: str) -> str:
        parsed = urllib.parse.urlparse(url if "://" in url else "https://" + url)
        host = (parsed.hostname or "").casefold().removeprefix("www.")
        return host + parsed.path.rstrip("/")
    return bool(a and b) and norm(a) == norm(b)


def json_from_text(text: str) -> object:
    """The answer as JSON, tolerating a fenced block around it."""
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1] if "\n" in stripped else ""
        stripped = stripped.rsplit("```", 1)[0]
    start = min((i for i in (stripped.find("["), stripped.find("{")) if i >= 0), default=-1)
    if start < 0:
        raise ValueError("no JSON in the answer")
    return json.JSONDecoder().raw_decode(stripped[start:])[0]


def main() -> int:
    argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter).parse_args()
    print("usage: python3 code/lead_magnet_model.py")
    print("This module is the shared OpenAI call. It only reports its key status here.")
    if not key():
        print(f"Not measured: {MISSING_KEY}")
        print("Without it lead_magnet_ai.py and the review themes stage skip themselves.")
        return 0
    print(f"{KEY_NAME} is readable. Model {MODEL}, {USD_PER_WEB_SEARCH:.2f} USD per web search "
          f"plus {USD_PER_M_INPUT:.2f}/{USD_PER_M_OUTPUT:.2f} USD per million input/output tokens.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
