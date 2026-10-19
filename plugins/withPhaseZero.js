const { withGradleProperties, withProjectBuildGradle } = require('expo/config-plugins');

// Never let Gradle silently install missing SDK platforms/NDK on limited bandwidth.
module.exports = (config) => {
  // Opt-in local compatibility experiment; the framework baseline remains the default.
  const installedTools = process.env.DUGHRI_USE_INSTALLED_TOOLCHAIN === '1';
  const cmakeVersion = installedTools ? '4.1.2' : '3.30.5';
  config = withGradleProperties(config, (mod) => {
    for (const [key, value] of Object.entries({
      'android.builder.sdkDownload': 'false',
      'reactNativeArchitectures': 'arm64-v8a',
      'android.minSdkVersion': '31',
      'android.cmakeVersion': cmakeVersion,
      'org.gradle.java.installations.auto-download': 'false',
    })) {
      mod.modResults = mod.modResults.filter((entry) => entry.key !== key);
      mod.modResults.push({ type: 'property', key, value });
    }
    return mod;
  });
  return withProjectBuildGradle(config, (mod) => {
    // Expo configures library NDKs during plugin application; set ext before that happens.
    const marker = '// Dughri installed-toolchain experiment';
    // Remove our previous override on every run so incremental prebuild can opt out.
    mod.modResults.contents = mod.modResults.contents.replace(
      /^[\t ]*\/\/ Dughri installed-toolchain experiment\r?\n[\t ]*rootProject\.ext\.ndkVersion = '30\.0\.16248370'\r?\n(?:\r?\n)?/gm,
      ''
    );
    if (installedTools) {
      if (!mod.modResults.contents.includes('apply plugin: "expo-root-project"')) {
        throw new Error('Cannot apply Dughri toolchain experiment: Expo root plugin anchor missing');
      }
      mod.modResults.contents = mod.modResults.contents.replace(
        'apply plugin: "expo-root-project"',
        `${marker}\nrootProject.ext.ndkVersion = '30.0.16248370'\n\napply plugin: "expo-root-project"`
      );
    }
    return mod;
  });
};
