module.exports = {
  root: true,
  plugins: ["@dvcol/presets"],
  extends: [
    "plugin:@dvcol/presets/typescript",
    "plugin:@dvcol/presets/vitest",
    "plugin:@dvcol/presets/prettier",
  ],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        packageDir: __dirname,
      },
    ],
  },
};
