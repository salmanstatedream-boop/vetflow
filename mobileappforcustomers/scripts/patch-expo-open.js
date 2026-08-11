/**
 * Re-applies Windows Expo browser-login fix after npm install.
 * Makes `npx expo login -b` keep waiting when `cmd start` fails.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'utils',
  'open.js'
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');
if (src.includes('Keep auth server alive')) {
  process.exit(0);
}

const needle = `async function spawnWindowsStartAsync(target, browserApp, browserArgs) {
    // Windows preserves env var case in Node, but the OS variable is \`SystemRoot\`.
    const systemRoot = process.env.SYSTEMROOT ?? process.env.SystemRoot ?? 'C:\\\\Windows';
    const cmd = _path().default.join(systemRoot, 'System32', 'cmd.exe');
    // \`start ""\` — the empty quoted string is the window title, so the URL isn't
    // interpreted as a title argument.
    const startArgs = [
        '/c',
        'start',
        '""'
    ];
    if (browserApp) startArgs.push(browserApp);
    startArgs.push(target, ...browserArgs);
    await (0, _spawnasync().default)(cmd, startArgs, {
        stdio: 'ignore'
    });
}`;

const replacement = `async function spawnWindowsStartAsync(target, browserApp, browserArgs) {
    // Windows preserves env var case in Node, but the OS variable is \`SystemRoot\`.
    const systemRoot = process.env.SYSTEMROOT ?? process.env.SystemRoot ?? 'C:\\\\Windows';
    const cmd = _path().default.join(systemRoot, 'System32', 'cmd.exe');
    if (browserApp && /\\.exe$/i.test(browserApp)) {
        try {
            const child = require('child_process').spawn(browserApp, [target, ...browserArgs], {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            return;
        } catch {}
    }
    const startArgs = ['/c', 'start', '""'];
    if (browserApp) startArgs.push(browserApp);
    startArgs.push(target, ...browserArgs);
    try {
        await (0, _spawnasync().default)(cmd, startArgs, { stdio: 'ignore' });
    } catch (error) {
        // Keep auth server alive — user can open the login URL printed above.
        console.warn('Could not auto-open browser; open the login URL printed above.');
    }
}`;

if (!src.includes('async function spawnWindowsStartAsync')) {
  process.exit(0);
}

if (src.includes(needle.replace(/\\\\/g, '\\'))) {
  // try simpler match
}

src = src.replace(
  /async function spawnWindowsStartAsync\([\s\S]*?\n\}/,
  replacement
);

if (!src.includes('Keep auth server alive')) {
  console.warn('patch-expo-open: pattern not matched; skip');
  process.exit(0);
}

fs.writeFileSync(target, src);
console.log('patch-expo-open: applied Windows browser login fix');
