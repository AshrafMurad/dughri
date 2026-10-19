// Import the official resumably-downloaded AAR into Gradle's content-addressed cache.
// This avoids restarting a large download on a slow connection; it does not alter the artifact.
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the path of the official react-android-0.88.0-debug.aar download');
const expected = '9e1a28738e5423f927b91fe1cd7122410f6e6530';
const hash = createHash('sha1');
for await (const bytes of createReadStream(source)) hash.update(bytes);
if (hash.digest('hex') !== expected) throw new Error('Artifact checksum mismatch; nothing imported');
const cache = join(process.env.GRADLE_USER_HOME ?? join(homedir(), '.gradle'),
  'caches', 'modules-2', 'files-2.1', 'com.facebook.react', 'react-android', '0.88.0', expected);
await mkdir(cache, { recursive: true });
await copyFile(source, join(cache, 'react-android-0.88.0-debug.aar'));
console.log('Imported official React Native 0.88.0 debug AAR; SHA-1 verified.');
