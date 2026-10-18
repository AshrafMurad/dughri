const { withGradleProperties, withProjectBuildGradle } = require('expo/config-plugins');

// Never let Gradle silently install missing SDK platforms/NDK on limited bandwidth.
module.exports = (config) => {
  config = withGradleProperties(config, (mod) => {
  for (const [key, value] of Object.entries({
    'android.builder.sdkDownload': 'false',
    'reactNativeArchitectures': 'arm64-v8a',
    'android.minSdkVersion': '31',
    'org.gradle.java.installations.auto-download': 'false',
  })) {
    mod.modResults = mod.modResults.filter((entry) => entry.key !== key);
    mod.modResults.push({ type: 'property', key, value });
  }
  return mod;
  });
  return withProjectBuildGradle(config, (mod) => {
    const marker = '// Dughri Phase 0 CMake version';
    if (!mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `\n${marker}
subprojects { subproject ->
  ['com.android.application', 'com.android.library'].each { pluginId ->
    subproject.pluginManager.withPlugin(pluginId) {
      subproject.extensions.getByName('android').externalNativeBuild.cmake.version = '3.30.5'
    }
  }
}
`;
    }
    return mod;
  });
};
