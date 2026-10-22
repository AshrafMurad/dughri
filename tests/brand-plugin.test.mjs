import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

test('Prebuild name mod preserves Arabic default and generates an English Android name idempotently', async () => {
  const config = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8')).expo;
  assert.equal(config.name, 'دغري');
  assert.ok(config.plugins.includes('./plugins/withDughriName'));
  let action;
  const files = new Map();
  const context = {
    module: { exports: {} },
    require: name => {
      if (name === 'node:path') return path;
      if (name === 'node:fs/promises') return {
        mkdir: async () => {},
        writeFile: async (name, contents) => { files.set(name, contents); },
      };
      assert.equal(name, 'expo/config-plugins');
      return { withDangerousMod: (config, [platform, run]) => { assert.equal(platform, 'android'); action = run; return config; } };
    },
  };
  vm.runInNewContext(readFileSync(new URL('../plugins/withDughriName.js', import.meta.url), 'utf8'), context);
  context.module.exports(config);
  const mod = { modRequest: { platformProjectRoot: '/test/android' } };
  await action(mod);
  await action(mod);
  assert.equal(files.size, 1);
  const [file, contents] = [...files][0];
  assert.equal(file, path.join('/test/android', 'app/src/main/res/values-en/dughri_brand.xml'));
  assert.match(contents, /<string name="app_name">Dughri<\/string>/);
});
