module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
    overrides: [
    {
      // Plain Node scripts (.cjs): no TS parsing, console + process are fine.
      files: ['**/*.cjs'],
      parserOptions: { sourceType: 'script' },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
        'no-undef': 'off',
      },
    },
    {
      // Backend server code: console logging is essential for observability.
      files: ['backend/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Test files: console.log is common in debug output.
      files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx', 'src/__tests__/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'eqeqeq': ['error', 'always'],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-undef': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist/', 'node_modules/', 'scripts/.backup/', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx', 'backend/tests/', 'server/', 'scripts/', 'backend/routes/admin.js'],
}
