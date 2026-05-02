module.exports = function (api) {
  const isWeb = api.caller((caller) => caller?.name === 'metro' && caller?.platform === 'web');
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: isWeb ? [] : ["react-native-reanimated/plugin"],
  };
};
