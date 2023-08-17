module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: './tsconfig.json',
  },
  extends: ["eslint:recommended"],
  ignorePatterns: ["/dist/**/*"],
  rules: {},
  overrides: [
    {
      files: ["*.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended",
      ],
    },
    {
      files: ["*.js"],
      env: { node: true },
    },
  ],
};