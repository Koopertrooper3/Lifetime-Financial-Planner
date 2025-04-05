## DEBUG Environment Setup Tutorial

### 1. Create the `.env` file for the frontend

Inside the `frontend/` folder, create a file named `.env` or `.env.local` and add:

```env
VITE_DEBUG_MODE=true
VITE_BACKEND_IP=localhost
VITE_BACKEND_PORT=8000
```

> These variables control frontend behavior,so you can use mock data (`VITE_DEBUG_MODE`), without worrying about the backend. 

To use DEBUG mode, make sure envDir in `vite.config.ts` is commented out.
```ts
// vite.config.ts
export default defineConfig({
  plugins: [...],
  //envDir: './..', // Make sure this line is commented out.
});
```

---

### 2. If you're using the root-level `test.env`

The `test.env` file in the root directory is used for backend configuration.:

```env
DATABASE_HOST=mongodb://127.0.0.1
GOOGLE_CLIENT_ID=...
VITE_BACKEND_IP=localhost
VITE_BACKEND_PORT=8000
```

#### By default, Vite **does not** read this file.

---

### 3. Enable `test.env` for frontend (when finished with debugging)

If you want the frontend to read from `test.env` instead of `frontend/.env`, **uncomment** the following line in `vite.config.ts`:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [...],
  envDir: './..', // Make sure this line is active
});
```

> Note: Doing this will disable the use of `frontend/.env`. 

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
