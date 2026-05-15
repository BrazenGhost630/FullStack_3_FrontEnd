const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for WASM files
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

// Configure transformer to handle WASM
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;
