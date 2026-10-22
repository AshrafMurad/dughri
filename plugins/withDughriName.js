const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

// Default launcher name is Arabic (app.json); Android's English resource is Dughri.
// Dedicated generated resource survives prebuild without editing other strings.
module.exports = (config) => withDangerousMod(config, ['android', async (mod) => {
  const directory = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/values-en');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'dughri_brand.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <string name="app_name">Dughri</string>\n</resources>\n', 'utf8');
  return mod;
}]);
