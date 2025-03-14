import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"), 
  {
    rules: {
      "react/no-unused-entities": "off", 
      "@next/next/no-img-element": "off", 
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unused-prop-types": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-expressions": "off"
    },
  },
];

export default eslintConfig;
