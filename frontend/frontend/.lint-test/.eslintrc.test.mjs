import js from '@eslint/js';
export default [ { files:['**/*.{js,jsx}'], extends:[js.configs.recommended], languageOptions:{ ecmaVersion:2022, sourceType:'module', parserOptions:{ ecmaFeatures:{jsx:true} } } } ];

