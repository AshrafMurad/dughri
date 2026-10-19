// Detach Metro with explicit log handles so closing the invoking shell does not stop it.
import { spawn } from 'node:child_process';
import { openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const log = process.argv[2] ?? join(tmpdir(), 'opencode', 'dughri-metro.log');
const fd = openSync(log, 'a');
const child = spawn(process.execPath, [
  '--dns-result-order=ipv4first',
  'node_modules/expo/bin/cli', 'start', '--dev-client', '--localhost', '--port', '8081',
], {
  cwd: process.cwd(), detached: true, windowsHide: true,
  stdio: ['ignore', fd, fd],
  env: { ...process.env, EXPO_NO_TELEMETRY: '1', EXPO_OFFLINE: '1', DUGHRI_USE_INSTALLED_TOOLCHAIN: '1' },
});
child.unref();
closeSync(fd);
console.log(`Metro process ${child.pid}; log: ${log}`);
