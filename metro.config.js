// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase v9+ modular entry points (`firebase/auth`, `firebase/app`) use package.json "exports".
// Without this, Metro may show: Unable to resolve "firebase/auth"
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
