/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-require-imports": "warn",
    "@typescript-eslint/no-empty-object-type": "warn",
    "react/no-unescaped-entities": "warn",
    "prefer-const": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/exhaustive-deps": "warn",
  },
};