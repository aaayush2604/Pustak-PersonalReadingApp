const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 👇 This is the key line:
  config.resolve.alias["victory-native"] = "victory";

  return config;
};
