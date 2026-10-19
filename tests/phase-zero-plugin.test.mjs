import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Config-mod test doubles exercise generation only, not Gradle or Android behavior.
function generate(installedTools, contents, properties = []) {
  const context = {
    module: { exports: {} },
    process: { env: { DUGHRI_USE_INSTALLED_TOOLCHAIN: installedTools ? '1' : '0' } },
    require: (name) => {
      assert.equal(name, 'expo/config-plugins');
      return {
        withGradleProperties: (config, action) => {
          config.properties = action({ modResults: properties }).modResults;
          return config;
        },
        withProjectBuildGradle: (config, action) => {
          config.contents = action({ modResults: { contents } }).modResults.contents;
          return config;
        },
      };
    },
  };
  vm.runInNewContext(readFileSync(new URL('../plugins/withPhaseZero.js', import.meta.url), 'utf8'), context);
  return context.module.exports({});
}

const baseline = '// Existing project settings\napply plugin: "expo-root-project"\n';
const cmake = (config) => config.properties.filter((entry) => entry.key === 'android.cmakeVersion');

test('toolchain opt-in is idempotent and opt-out restores baseline on incremental generation', () => {
  const enabled = generate(true, baseline);
  assert.match(enabled.contents, /ndkVersion = '30\.0\.16248370'/);
  assert.equal(cmake(enabled)[0].value, '4.1.2');
  const repeated = generate(true, enabled.contents, enabled.properties);
  assert.equal(repeated.contents, enabled.contents);
  assert.equal(cmake(repeated).length, 1);
  const disabled = generate(false, repeated.contents, repeated.properties);
  assert.equal(disabled.contents, baseline);
  assert.equal(cmake(disabled).length, 1);
  assert.equal(cmake(disabled)[0].value, '3.30.5');
});

test('opt-out handles CRLF and preserves unrelated custom NDK settings', () => {
  const enabled = generate(true, baseline);
  assert.equal(generate(false, enabled.contents.replaceAll('\n', '\r\n')).contents,
    baseline.replaceAll('\n', '\r\n'));
  const custom = `rootProject.ext.ndkVersion = 'custom'\n${baseline}`;
  assert.equal(generate(false, custom).contents, custom);
});

test('toolchain opt-in fails explicitly if the generated Expo anchor changes', () => {
  assert.throws(() => generate(true, '// Unexpected template\n'), /anchor missing/);
});
