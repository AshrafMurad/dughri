import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Local-only image processing with Expo's already installed image tooling.
// Preserve both owner originals; pad a derivative into the adaptive-icon safe area.
const require = createRequire(import.meta.url);
const expoRequire = createRequire(require.resolve('expo/package.json'));
const { generateImageAsync, generateImageBackgroundAsync, compositeImagesAsync } = expoRequire('@expo/image-utils');
const root = fileURLToPath(new URL('../', import.meta.url));
const foreground = await generateImageAsync({ projectRoot: root }, {
  src: path.join(root, 'assets/app-icon.png'), width: 660, height: 660, resizeMode: 'contain',
});
const background = await generateImageBackgroundAsync({ width: 1080, height: 1080, backgroundColor: 'transparent' });
const output = await compositeImagesAsync({ foreground: foreground.source, background, x: 210, y: 210 });
await writeFile(path.join(root, 'assets/app-icon-adaptive.png'), output);
console.log('Prepared padded adaptive foreground from the owner-supplied icon; originals preserved.');
