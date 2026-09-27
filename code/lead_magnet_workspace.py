"""Find the repository root, so every audit script writes to the same place.

`BLUEPRINT_ROOT` overrides it, which is how `code/lead_magnet_build.py` keeps a
staged run inside its own folder.
"""

from __future__ import annotations

import os
from pathlib import Path


def workspace_root() -> Path:
    configured = os.environ.get("BLUEPRINT_ROOT")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parent.parent
