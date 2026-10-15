#!/usr/bin/env node
/**
 * build_isabel_filmcraft.js
 *
 * Standalone builder for the Isabel Pepe FilmCraft reel.
 *
 * It:
 *   1. creates  isabel-pepe/filmcraft_demo
 *   2. copies   isabel_avatar.mp4, isabel_broll.mp4, isabel_mixed_audio.mp3
 *               from creativia-video-factory/public
 *   3. writes   isabel_subtitles.srt (exact SRT text, CRLF, UTF-8 no BOM)
 *   4. writes   commands.jsonl and drives filmcraft-cli to build the project
 *               and save it as filmcraft_demo/isabel_reel.fcproj
 *
 * Usage:  node build_isabel_filmcraft.js
 * No dependencies. Node 16+.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ISABEL_DIR = path.resolve(__dirname);
const DEMO_DIR = path.join(ISABEL_DIR, 'filmcraft_demo');

const SOURCE_DIR = path.resolve(
  'C:/Users/mario/Progetti Antigravity/creativia-video-factory/public'
);

// Source file -> destination file name (kept identical).
const MEDIA_FILES = [
  'isabel_avatar.mp4',
  'isabel_broll.mp4',
  'isabel_mixed_audio.mp3',
];

const SRT_NAME = 'isabel_subtitles.srt';
const COMMANDS_NAME = 'commands.jsonl';
const PROJECT_NAME = 'isabel_reel.fcproj';

const SRT_PATH = path.join(DEMO_DIR, SRT_NAME);
const COMMANDS_PATH = path.join(DEMO_DIR, COMMANDS_NAME);
const PROJECT_PATH = path.join(DEMO_DIR, PROJECT_NAME);

// Exact subtitle text required by the brief (note: line 2 has no final period).
const SRT_CONTENT = [
  '1',
  '00:00:00,300 --> 00:00:02,300',
  'Benvenuta nel mondo di Isabel Pepe.',
  '',
  '2',
  '00:00:02,900 --> 00:00:04,300',
  "L'eleganza senza tempo",
  '',
  '3',
  '00:00:04,300 --> 00:00:05,900',
  'dei gioielli che parlano di te.',
  '',
].join('\r\n');

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const log = (msg) => console.log(`[isabel] ${msg}`);
const fail = (msg) => {
  console.error(`[isabel] ERROR: ${msg}`);
  process.exit(1);
};

/** UTF-8 without BOM (a BOM breaks filmcraft-cli's JSONL parser). */
function writeTextNoBom(file, text) {
  fs.writeFileSync(file, text, { encoding: 'utf8' });
}

/** Quote one argument for a Windows cmd.exe command line. */
function quoteArg(arg) {
  const s = String(arg);
  if (/^[A-Za-z0-9_./:=+-]+$/.test(s)) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Run filmcraft-cli. On Windows the launcher is a .cmd shim, so it must go
 * through a shell; every argument is quoted to survive spaces in paths.
 */
function runCli(args) {
  const isWin = process.platform === 'win32';
  const line = ['filmcraft-cli', ...args].map(quoteArg).join(' ');

  const res = spawnSync(line, {
    shell: true,
    encoding: 'utf8',
    windowsHide: true,
  });

  if (res.error) {
    fail(`could not run filmcraft-cli (${res.error.message}). Is it on PATH?`);
  }
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

/** filmcraft-cli `run` prints one JSON object per line. */
function parseJsonl(stdout) {
  const out = [];
  for (const raw of stdout.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line[0] !== '{') continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      /* non-JSON diagnostics are ignored */
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Step 1 - create the demo folder
// ---------------------------------------------------------------------------

function ensureDemoDir() {
  fs.mkdirSync(DEMO_DIR, { recursive: true });
  log(`demo folder ready: ${DEMO_DIR}`);
}

// ---------------------------------------------------------------------------
// Step 2 - copy the media
// ---------------------------------------------------------------------------

function copyMedia() {
  if (!fs.existsSync(SOURCE_DIR)) {
    fail(`source folder not found: ${SOURCE_DIR}`);
  }

  for (const name of MEDIA_FILES) {
    const src = path.join(SOURCE_DIR, name);
    const dst = path.join(DEMO_DIR, name);

    if (!fs.existsSync(src)) fail(`missing source media: ${src}`);

    fs.copyFileSync(src, dst);

    const srcSize = fs.statSync(src).size;
    const dstSize = fs.statSync(dst).size;
    if (srcSize !== dstSize) {
      fail(`copy mismatch for ${name} (${srcSize} != ${dstSize})`);
    }
    log(`copied ${name} (${dstSize} bytes)`);
  }
}

// ---------------------------------------------------------------------------
// Step 3 - subtitles
// ---------------------------------------------------------------------------

function writeSubtitles() {
  writeTextNoBom(SRT_PATH, SRT_CONTENT);
  log(`wrote ${SRT_NAME}`);
}

// ---------------------------------------------------------------------------
// Step 4 - commands.jsonl + filmcraft-cli
// ---------------------------------------------------------------------------

/**
 * The build, in order. Item ids 1/2/3 are deterministic: this runs against a
 * brand-new in-memory project (file.newProject), so imports are numbered from 1
 * in the order given below.
 *
 *   1 = isabel_avatar.mp4   2 = isabel_broll.mp4   3 = isabel_mixed_audio.mp3
 *
 * Layout: avatar then broll back-to-back on V1 (video only, so the clips stay
 * silent), the mixed soundtrack on A1, the SRT imported as a Subtitle track.
 */
function buildCommands() {
  return [
    '# FilmCraft build for the Isabel Pepe reel (generated).',
    { id: 'file.newProject', params: { name: 'isabel_reel' } },
    {
      id: 'file.import',
      params: {
        paths: MEDIA_FILES.map((n) => path.join(DEMO_DIR, n)),
      },
    },
    {
      id: 'file.newSequence',
      params: {
        name: 'Isabel Reel',
        width: 1280,
        height: 720,
        fps: 25,
        sampleRate: 48000,
        video: 3,
        audio: 3,
      },
    },
    // Video: avatar then broll back to back from 00:00, audio stripped.
    {
      id: 'timeline.place',
      params: { items: [1, 2], track: 'V1', seconds: 0, audio: false },
    },
    // Soundtrack.
    {
      id: 'timeline.place',
      params: { item: 3, track: 'A1', seconds: 0 },
    },
    // Subtitles.
    {
      id: 'captions.import',
      params: { path: SRT_PATH, name: 'Italiano' },
    },
  ];
}

function writeCommandsFile(commands) {
  const jsonl = commands
    .map((c) => (typeof c === 'string' ? c : JSON.stringify(c)))
    .join('\n');
  writeTextNoBom(COMMANDS_PATH, jsonl + '\n');
  log(`wrote ${COMMANDS_NAME}`);
}

function renderProject() {
  log('running filmcraft-cli ...');
  const res = runCli(['--save-as', PROJECT_PATH, 'run', COMMANDS_PATH]);

  const results = parseJsonl(res.stdout);
  const failed = results.filter((r) => r.ok === false);
  for (const r of results) {
    log(`  ${r.ok === false ? 'FAIL' : 'ok  '} ${r.id}${r.error ? ` - ${r.error}` : ''}`);
  }

  if (res.stderr.trim()) {
    for (const l of res.stderr.trim().split(/\r?\n/)) log(`  stderr: ${l}`);
  }

  if (failed.length || res.status !== 0) {
    fail(`filmcraft-cli exited with status ${res.status}`);
  }
  if (!fs.existsSync(PROJECT_PATH)) {
    fail(`project was not written: ${PROJECT_PATH}`);
  }
  log(`saved project: ${PROJECT_PATH}`);
}

/** Re-open the saved project and report what was actually built. */
function verifyProject() {
  const res = runCli(['--project', PROJECT_PATH, 'inspect']);
  if (res.status !== 0) {
    fail(`inspect failed with status ${res.status}`);
  }

  let info;
  try {
    info = JSON.parse(res.stdout);
  } catch {
    log('inspect returned non-JSON output; skipping verification');
    return;
  }

  const project = info.project || info;
  const root = project.root || {};
  const children = Array.isArray(root.children) ? root.children : [];
  log(`verify: ${children.length} media item(s), active sequence: ${project.activeSequence ?? 'none'}`);
  for (const c of children) {
    log(`  item ${c.item}: ${c.name} (${c.type})`);
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  log('=== build Isabel Pepe FilmCraft reel ===');
  ensureDemoDir();
  copyMedia();
  writeSubtitles();
  writeCommandsFile(buildCommands());
  renderProject();
  verifyProject();
  log('done.');
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, buildCommands, SRT_CONTENT, DEMO_DIR, PROJECT_PATH };
}
