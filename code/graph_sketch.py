#!/usr/bin/env python3
"""The plan diagram as text, before anyone renders or publishes it.

    python3 code/graph_sketch.py jobs/<id>/pitch-graph.json

A pitch page's diagram is the part a client studies, and it used to be judged for the
first time as a rendered image on a public URL. That is the wrong moment: by then the
page exists, the deploy ran, and changing the flow means doing all of it again. Printed
as text it can be read in the terminal in ten seconds and argued about in words, which
is the only cheap round of edits a diagram ever gets.

It draws what the file says and nothing it wishes were there: one block per phase, every
node with who owns it, every edge with its label, and the three things the diagram is
supposed to prove, counted rather than claimed. A node nobody points at, a decision with
one exit, a phase with a single step: all of them are visible here and invisible in a
picture.
"""
import argparse
import collections
import json
import pathlib
import sys

KIND_MARK = {'source': '>', 'sink': '=', 'decision': '?', 'datastore': '#',
             'service': '~', 'actor': '@', 'note': '-', 'milestone': '*', 'step': '.'}
OWNER_MARK = {'you': 'you', 'client': 'CLIENT RUNS IT', 'thirdparty': 'third party'}


def load(path):
    try:
        value = json.loads(pathlib.Path(path).read_text(encoding='utf-8'))
    except OSError as error:
        sys.exit(f'ABORT: {path} could not be read: {error}')
    except json.JSONDecodeError as error:
        sys.exit(f'ABORT: {path} is not valid JSON at line {error.lineno}.')
    if not isinstance(value, dict):
        sys.exit('ABORT: the graph must be a JSON object with nodes, edges and groups.')
    return value


def sketch(graph):
    nodes = {str(n.get('id')): n for n in graph.get('nodes') or [] if isinstance(n, dict)}
    edges = [e for e in graph.get('edges') or [] if isinstance(e, dict)]
    groups = [g for g in graph.get('groups') or [] if isinstance(g, dict)]
    out = collections.defaultdict(list)
    for edge in edges:
        out[str(edge.get('from'))].append(edge)
    lines, placed = [], set()
    for index, group in enumerate(groups, 1):
        lines.append(f'\nPHASE {index}: {group.get("label") or "(no label)"}')
        members = [str(i) for i in group.get('nodes') or []]
        if len(members) < 2:
            lines.append('   ! only one step in this phase, which is a list with rounded corners')
        for node_id in members:
            placed.add(node_id)
            node = nodes.get(node_id)
            if not node:
                lines.append(f'   ! {node_id} is in this phase and not in nodes')
                continue
            mark = KIND_MARK.get(str(node.get('kind')), '.')
            owner = OWNER_MARK.get(str(node.get('owner')), str(node.get('owner') or ''))
            lines.append(f'   [{mark}] {node.get("label") or node_id}   ({owner})')
            for edge in out.get(node_id, []):
                label = f' -- {edge["label"]}' if edge.get('label') else ''
                target = nodes.get(str(edge.get('to')), {})
                arrow = '-->' if not edge.get('dashed') else '..>'
                lines.append(f'        {arrow} {target.get("label") or edge.get("to")}{label}')
    loose = [i for i in nodes if i not in placed]
    if loose:
        lines.append('\nIN NO PHASE: ' + ', '.join(nodes[i].get('label') or i for i in loose))
    return lines, nodes, edges, out


def proofs(nodes, edges, out):
    """The three things the command says a diagram must show, counted."""
    labelled_forks = [n for n, group in out.items()
                      if str(nodes.get(n, {}).get('kind')) == 'decision' and len(group) >= 2
                      and all(e.get('label') for e in group)]
    bare_forks = [n for n, group in out.items()
                  if str(nodes.get(n, {}).get('kind')) == 'decision'
                  and (len(group) < 2 or not all(e.get('label') for e in group))]
    client = [n for n, node in nodes.items() if str(node.get('owner')) == 'client']
    questions = [n for n, node in nodes.items() if str(node.get('kind')) == 'note']
    unreached = [n for n in nodes if not any(str(e.get('to')) == n for e in edges)
                 and str(nodes[n].get('kind')) != 'source']
    return labelled_forks, bare_forks, client, questions, unreached


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('graph')
    args = ap.parse_args(argv)
    graph = load(args.graph)
    lines, nodes, edges, out = sketch(graph)
    print('\n'.join(lines).lstrip('\n'))
    labelled, bare, client, questions, unreached = proofs(nodes, edges, out)
    print(f'\n{len(nodes)} nodes, {len(edges)} edges, {len(graph.get("groups") or [])} phases.')
    print(f'earns its place: {len(labelled)} labelled decision(s), {len(client)} node(s) the client '
          f'already runs, {len(questions)} open question(s). One of the three is enough.')
    if bare:
        print(f'FIX: decision(s) with one exit or an unlabelled exit: '
              f'{", ".join(nodes[n].get("label") or n for n in bare)}')
    if unreached:
        print(f'FIX: nothing points at: {", ".join(nodes[n].get("label") or n for n in unreached)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
