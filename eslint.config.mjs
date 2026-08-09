import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Token enforcement. Components may only use semantic utilities from
 * globals.css layer 3. Raw colours and Tailwind palette utilities fail CI.
 * Mail templates are exempt (rules.md §3.6).
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
  {
    files: ["**/*.tsx"],
    ignores: ["src/lib/mail.ts", "**/emails/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(?:#[0-9a-fA-F]{3,8}\\b|\\b(?:rgb|hsl|oklch)\\s*\\()/]",
          message:
            "Raw colour literals are banned in .tsx. Add a token in globals.css and use a semantic utility.",
        },
        {
          selector:
            "TemplateElement[value.raw=/(?:#[0-9a-fA-F]{3,8}\\b|\\b(?:rgb|hsl|oklch)\\s*\\()/]",
          message:
            "Raw colour literals are banned in .tsx. Add a token in globals.css and use a semantic utility.",
        },
        {
          selector:
            "Literal[value=/\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|accent|caret|divide|placeholder|shadow)-\\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl|oklch)[^\\]]*)\\]/]",
          message:
            "Tailwind arbitrary colour values are banned. Use semantic utilities from the token system.",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|accent|caret|divide|placeholder|shadow)-\\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl|oklch)[^\\]]*)\\]/]",
          message:
            "Tailwind arbitrary colour values are banned. Use semantic utilities from the token system.",
        },
        {
          selector:
            "Literal[value=/\\b(?:bg|text|border|ring|fill|stroke|divide)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))\\b/]",
          message:
            "Tailwind palette utilities are banned. Use semantic utilities (bg-surface, text-foreground, …).",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\b(?:bg|text|border|ring|fill|stroke|divide)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))\\b/]",
          message:
            "Tailwind palette utilities are banned. Use semantic utilities (bg-surface, text-foreground, …).",
        },
      ],
    },
  },
]);

export default eslintConfig;
