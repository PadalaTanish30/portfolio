import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Next.js 16 ships native ESLint flat configs, so they can be spread directly.
 * (`FlatCompat` is the pre-v16 workaround and breaks on these exports.)
 */
const eslintConfig = [...nextCoreWebVitals, ...nextTypescript];

export default eslintConfig;
