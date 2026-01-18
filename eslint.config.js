// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  // =========================
  // TS (Angular / TypeScript)
  // =========================
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // ✅ Mantém padrão de seleção
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      // ✅ Como tu está migrando do React, isto vai atrapalhar muito agora:
      // (pode reativar depois quando o projeto estiver maduro)
      "@angular-eslint/prefer-inject": "off",

      // ✅ Permite any temporariamente (migração)
      "@typescript-eslint/no-explicit-any": "off",

      // ✅ Melhor prática (não quebra teu app):
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // =========================
  // HTML Templates
  // =========================
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // ✅ Angular 17+ recomenda @if/@for, mas isso é CHATO na migração
      "@angular-eslint/template/prefer-control-flow": "off",

      // ✅ enquanto tu usa (click) em div/li etc
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
    },
  },
]);
