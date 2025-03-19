// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import {globalIgnores} from "eslint/config"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  globalIgnores(["scraper/*.js","server/*.js","db/*.js"])
);