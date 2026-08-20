/**
 * Generates one Markdown handoff per feature + INDEX.md + START-PROMPTS.md.
 * Source of truth = the UNITS array below. Everything else is derived.
 *
 * Invariants:
 *   - Existing statuses in INDEX.md are preserved across runs.
 *   - Dropped units are declared in the array (`dropped: "reason"`), never by editing INDEX.md.
 *   - Orphan handoffs (no matching unit) are reported at the end.
 *
 * Run:  node work/_generate-units.mjs
 */
import {
  writeFileSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const HANDOFFS = join(ROOT, 'handoffs');
mkdirSync(HANDOFFS, { recursive: true });

const PROJECT = 'ShowXhrUrl';
const UNIT_NAME = 'feature';
const WORK_DIR = 'work';
const VERIFY = 'npm run check && npm run build';
const BUILD_SKILL = 'build-a-feature';
const CONVENTIONS_SKILL = 'showxhr-conventions';
const ARCHITECTURE_RULE =
  'the three-context separation (background / content / sidepanel, shared contract in src/shared)';
const CONSTRAINTS = 'English only, no `any`, no new eslint-disable, no relaxed tsconfig flag';

const UNITS = [
  {
    id: 'capture-pipeline',
    title: 'Capture pipeline',
    entry: 'src/background/index.ts',
    path: 'src/background/',
    container: 'service worker',
    priority: 'P0',
    spec: '(the one thing it must do: never lose a request)',
    pieces: {
      Owns: [
        'request-store.ts - per-tab index keyed by requestId, FIFO eviction',
        'page-hints.ts - XHR/fetch correlation, 10s TTL',
        'headers.ts, request-body.ts - decoding',
      ],
      Contract: [
        'src/shared/types.ts - DetailedRequest',
        'src/shared/messaging.ts - the message union and its guards',
      ],
    },
    states: [
      'pending (no onCompleted yet, normal for a long-poll)',
      'complete',
      'failed (onErrorOccurred fires instead of onCompleted)',
    ],
    notes: [
      'Five webRequest events, one requestId. Never correlate on URL.',
      'tabId is -1 for requests with no owning tab; drop those.',
      'Broadcasts are coalesced on a 120ms timer; never send per event.',
      'The worker is evicted after ~30s and loses everything in memory.',
    ],
  },
  {
    id: 'side-panel-ui',
    title: 'Side panel UI',
    entry: 'src/sidepanel/index.html',
    path: 'src/sidepanel/',
    container: 'React 19 side panel',
    priority: 'P0',
    spec: '(Features section of docs/BRIEF.md)',
    pieces: {
      Components: [
        'Header, Toolbar, FilterPanel, RequestList (virtualised), RequestItem, RequestDetails, ResponseViewer, ExportModal',
        'ui/ - Badge, Button, Input',
      ],
      State: [
        'stores/requestStore.ts - Zustand, plus the useFilteredRequests selector',
        'hooks/useRequestSync.ts - mounted once, owns the chrome listeners',
        'hooks/useTheme.ts - useSyncExternalStore over the media query',
      ],
    },
    states: ['loading', 'empty (no requests captured)', 'populated', 'a request selected'],
    notes: [
      'Subscribe with narrow selectors; the panel re-renders on every broadcast.',
      'useRequestSync must be mounted exactly once, at the root.',
      'Theme is painted in main.tsx before React mounts, to avoid a wrong-palette frame.',
    ],
  },
  {
    id: 'filters',
    title: 'Filtering and search',
    entry: 'src/sidepanel/stores/requestStore.ts',
    path: 'src/sidepanel/components/FilterPanel.tsx',
    container: 'Zustand selector',
    priority: 'P1',
    spec: '(Advanced filters, docs/BRIEF.md)',
    pieces: {
      Owns: [
        'useFilteredRequests selector',
        'Toolbar method buttons and search box',
        'FilterPanel: status class, content type, resource type',
      ],
    },
    states: ['no filter', 'one filter', 'several filters combined', 'no match'],
    notes: [
      'fetch and xhr are not resource types: the browser reports both as xmlhttprequest. They match on the initiator hint instead.',
      'Filtering is re-derived every render; at 2000 rows behind a virtualiser that is not measurable.',
    ],
  },
  {
    id: 'request-replay',
    title: 'Request replay',
    entry: 'src/sidepanel/lib/requestSimulator.ts',
    path: 'src/sidepanel/lib/requestSimulator.ts',
    container: 'side panel',
    priority: 'P1',
    spec: '(Request replay, docs/BRIEF.md)',
    pieces: {
      Owns: [
        'simulateRequest with AbortController and a 30s timeout',
        'CSRF token extraction and header forwarding',
        'ResponseViewer for the result',
      ],
    },
    states: ['idle', 'in flight (cancellable)', 'succeeded', 'failed', 'cancelled or timed out'],
    notes: [
      'Replay is a second, separate request. It is not the original response.',
      'Credentials are not sent, so an authenticated endpoint replays as anonymous. Open question in docs/BRIEF.md.',
    ],
  },
  {
    id: 'export-formats',
    title: 'Export formats',
    entry: 'src/sidepanel/lib/export.ts',
    path: 'src/sidepanel/lib/export.ts',
    container: 'side panel',
    priority: 'P1',
    spec: '(Four export formats, docs/BRIEF.md)',
    pieces: {
      Owns: ['JSON', 'HAR 1.2', 'cURL command lines', 'Postman v2.1 collection', 'ExportModal'],
    },
    states: [
      'nothing to export (button disabled)',
      'export with headers',
      'export without headers',
    ],
    notes: [
      'HAR and Postman are built as untyped object literals; a missing required field only shows up in the consuming tool. See unit typed-export-schemas.',
    ],
  },
  {
    id: 'unit-tests',
    title: 'Unit tests for the pure modules',
    entry: 'vitest',
    path: 'src/background/request-store.ts, src/background/page-hints.ts, src/sidepanel/lib/export.ts',
    container: 'Vitest',
    priority: 'P0',
    spec: '(architecture-review proposal 1)',
    pieces: {
      Scope: [
        'request-store: eviction order, merge on unknown id, per-tab isolation',
        'page-hints: TTL expiry, one hint consumed per matching request, ordering',
        'export: all four formats against a fixed input',
      ],
      'Explicitly out': [
        'No component tests, no DOM, no extension harness - they need a browser and cost more than they return at this size.',
      ],
    },
    states: ['n/a'],
    notes: [
      'There is no test of any kind today. These three modules are pure functions of their input, which is exactly where a silent regression is invisible.',
      'Add a `test` script and fold it into `npm run check`.',
    ],
  },
  {
    id: 'ci-pipeline',
    title: 'CI on push and pull request',
    entry: '.github/workflows/ci.yml',
    path: '.github/workflows/',
    container: 'GitHub Actions',
    priority: 'P0',
    spec: '(architecture-review proposal 2)',
    pieces: {
      Scope: [
        'Node 22, npm ci, npm run check, npm run build',
        'Triggered on push to v2 and on pull_request',
      ],
    },
    states: ['n/a'],
    notes: [
      'Dependabot already opens PRs here and nothing tells anyone whether one breaks the build.',
      'Do not run it on v1; that branch is frozen.',
    ],
  },
  {
    id: 'error-surface',
    title: 'Surface errors to the user',
    entry: 'src/sidepanel/components/Header.tsx',
    path: 'src/sidepanel/',
    container: 'side panel',
    priority: 'P1',
    spec: '(architecture-review proposal 3)',
    pieces: {
      Scope: [
        'An `error` field on the Zustand store',
        'A status line in the header',
        'Fed from requestActions and storage failures',
      ],
    },
    states: ['no error', 'worker unreachable', 'IndexedDB write failed'],
    notes: [
      'console.error is the entire error strategy today: the panel shows an empty list and the user reads it as "no requests".',
    ],
  },
  {
    id: 'split-request-details',
    title: 'Split RequestDetails into panes',
    entry: 'src/sidepanel/components/RequestDetails.tsx',
    path: 'src/sidepanel/components/details/',
    container: 'side panel',
    priority: 'P2',
    spec: '(architecture-review proposal 4)',
    pieces: {
      Scope: ['Extract GeneralInfo, HeadersTable and the simulation pane into components/details/'],
    },
    states: ['n/a'],
    notes: [
      '228 lines doing four things - the only file in the codebase doing more than one. Readable today; do it when the next tab is added.',
    ],
  },
  {
    id: 'typed-export-schemas',
    title: 'Type the HAR and Postman output',
    entry: 'src/sidepanel/lib/export.ts',
    path: 'src/sidepanel/lib/export.ts',
    container: 'side panel',
    priority: 'P2',
    spec: '(architecture-review proposal 5)',
    pieces: {
      Scope: [
        'Interfaces for HAR 1.2 and Postman v2.1 in src/sidepanel/lib/',
        'Build the literals against them',
      ],
    },
    states: ['n/a'],
    notes: [
      'A missing required field currently only shows up when the exported file is opened in another tool.',
    ],
  },
];

const live = UNITS.filter((u) => !u.dropped);
const list = (arr) => (arr?.length ? arr.map((x) => `- ${x}`).join('\n') : '- _none yet_');
const piecesBlock = (pieces = {}) =>
  Object.entries(pieces)
    .map(([g, items]) => `**${g}**\n\n${list(items)}`)
    .join('\n\n') || '- _to be defined_';

const shortPrompt = (u) =>
  `Build "${u.title}" for ${PROJECT} (${u.entry}). BEFORE coding, read: ${WORK_DIR}/handoffs/${u.id}.md, ` +
  `the existing implementation in ${u.path}, and the ${BUILD_SKILL} skill (+ ${CONVENTIONS_SKILL}). ` +
  `Follow ${ARCHITECTURE_RULE}; this unit lives in the ${u.container}. ` +
  `${CONSTRAINTS}. Finish with: ${VERIFY}, then reload the unpacked build and confirm it works. ` +
  `Then refresh PROJECT-STATE.md and set this unit to done in ${WORK_DIR}/INDEX.md.`;

const handoffMd = (u) => `# Handoff — ${u.title}

> **Entry**: \`${u.entry}\` · **Priority**: ${u.priority} · **Context**: ${u.container}

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [\`../../PROJECT-STATE.md\`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, \`${u.path}\` — match its conventions
- 📐 **Spec**: \`docs/BRIEF.md\` ${u.spec}
- ⚠️ **Traps**: \`docs/STACK.md\` — check the APIs this unit uses
- 🛠️ **Skills**: \`${BUILD_SKILL}\`, \`${CONVENTIONS_SKILL}\`, \`extension-architecture\`

## 2. Entry & files

- **Entry**: \`${u.entry}\`
- **Implementation**: \`${u.path}\`
- **Runs in**: ${u.container}

## 3. Pieces

${piecesBlock(u.pieces)}

## 4. States to cover

${list(u.states)}

## 5. Watch-points

${list(u.notes)}

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with \`${CONVENTIONS_SKILL}\`
- [ ] All states in §4 are handled
- [ ] ${CONSTRAINTS}
- [ ] \`${VERIFY}\` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] \`PROJECT-STATE.md\` refreshed and INDEX status set to \`✅ done\`

## 7. Start prompt (paste to Claude Code)

\`\`\`
${shortPrompt(u)}
\`\`\`
`;

const INDEX_PATH = join(ROOT, 'INDEX.md');
const DEFAULT_STATUS = '⬜ todo';

function readStatuses() {
  if (!existsSync(INDEX_PATH)) return {};
  const statuses = {};
  for (const line of readFileSync(INDEX_PATH, 'utf8').split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    const id = cells
      .find((c) => c.includes('./handoffs/'))
      ?.match(/\.\/handoffs\/([\w-]+)\.md/)?.[1];
    if (id) statuses[id] = cells[cells.length - 2] || DEFAULT_STATUS;
  }
  return statuses;
}

const statuses = readStatuses();
const SEEDED = {
  'capture-pipeline': '✅ done',
  'side-panel-ui': '✅ done',
  filters: '✅ done',
  'request-replay': '✅ done',
  'export-formats': '✅ done',
};
const statusOf = (u) =>
  u.dropped ? '🚫 dropped' : (statuses[u.id] ?? SEEDED[u.id] ?? DEFAULT_STATUS);

for (const u of live) writeFileSync(join(HANDOFFS, `${u.id}.md`), handoffMd(u), 'utf8');
for (const u of UNITS.filter((u) => u.dropped)) {
  const stale = join(HANDOFFS, `${u.id}.md`);
  if (existsSync(stale)) {
    unlinkSync(stale);
    console.log(`  removed stale handoff: ${u.id}.md`);
  }
}

const row = (u) => {
  const link = u.dropped ? `_dropped — ${u.dropped}_` : `[handoff](./handoffs/${u.id}.md)`;
  const title = u.dropped ? `~~**${u.title}**~~` : `**${u.title}**`;
  return `| ${u.dropped ? `~~${u.priority}~~` : u.priority} | ${title} | \`${u.entry}\` | ${link} | ${u.container} | ${statusOf(u)} |`;
};
const byPrio = (p) => live.filter((u) => u.priority === p).map((u) => u.title);

writeFileSync(
  INDEX_PATH,
  `# Feature index — ${PROJECT}

Each ${UNIT_NAME} has a **handoff** (what to read, pieces, states, definition of done, start prompt).
Generated — edit \`_generate-units.mjs\`, not this file.
**The Status column is the exception**: it is hand-updated and preserved across regenerations.

> Before building: read the handoff, then follow the \`${BUILD_SKILL}\` skill.

## Features

| Prio | Feature | Entry | Links | Context | Status |
| --- | --- | --- | --- | --- | --- |
${UNITS.map(row).join('\n')}

Status vocabulary: \`⬜ todo\` · \`🟡 in progress\` · \`✅ done\` · \`🚫 dropped\`
Declare an abandoned unit with \`dropped: "reason"\` in the array, never by editing this file.

## Suggested order

1. **P0** — ${byPrio('P0').join(' · ') || '_none_'}
2. **P1** — ${byPrio('P1').join(' · ') || '_none_'}
3. **P2** — ${byPrio('P2').join(' · ') || '_none_'}

The done rows describe what already exists; their handoffs document the shipped behaviour and its
watch-points, and are the reference for editing them. The ranked reasoning behind the todo rows is
in the \`architecture-review\` skill.

## Regenerate

\`\`\`bash
node ${WORK_DIR}/_generate-units.mjs
\`\`\`
`,
  'utf8',
);

writeFileSync(
  join(ROOT, 'START-PROMPTS.md'),
  `# Start prompts — one ${UNIT_NAME} at a time

Copy a block into Claude Code. Each prompt forces reading the handoff and the skills before coding,
and closing the context loop after.

${live.map((u) => `## ${u.title} — \`${u.entry}\` (${u.priority}) — ${statusOf(u)}\n\n\`\`\`\n${shortPrompt(u)}\n\`\`\`\n`).join('\n')}`,
  'utf8',
);

const expected = new Set(live.map((u) => `${u.id}.md`));
const orphans = readdirSync(HANDOFFS).filter((f) => f.endsWith('.md') && !expected.has(f));
console.log(`OK — ${live.length} handoff(s) + INDEX.md + START-PROMPTS.md.`);
if (orphans.length) console.log(`  ⚠ orphan handoff(s): ${orphans.join(', ')}`);
