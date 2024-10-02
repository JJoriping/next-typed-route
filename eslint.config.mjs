import daldalsoPlugin from "@daldalso/eslint-plugin";

export default [
  {
    ignores: [ "res/" ]
  },
  daldalsoPlugin.configs.all,
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': ["error", {
        allowTaggedTemplates: true
      }]
    }
  }
];