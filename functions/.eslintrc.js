module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "always"], // Google style often conflicts here
  },
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
        tsconfigRootDir: __dirname, // Ensures it finds the config correctly
      },
      plugins: ["@typescript-eslint", "import"],
      extends: [
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
      ],
      rules: {
        // Consider configuring eslint-import-resolver-typescript instead of disabling this rule.
        "import/no-unresolved": 0,
        "@typescript-eslint/no-explicit-any": "off", // Helpful for FRC API data
      },
    },
  ],
  ignorePatterns: [
    "lib/",
    "generated/",
    "node_modules/",
    "!src/", // Explicitly un-ignore the src directory to override other ignore patterns
  ],
};
