import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
    // Игнорируемые файлы и папки
    {
        ignores: [
            'dist/**',
            'build/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
            'electron/**',
            'server.cjs'
        ]
    },

    // Базовые настройки для всех файлов
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,

    // Настройки для TypeScript и React файлов
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021
            },
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                },
                project: false
            }
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@stylistic': stylistic
        },
        rules: {
            // React Hooks правила
            ...reactHooks.configs.recommended.rules,
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react-refresh/only-export-components': ['error', { allowConstantExport: true }],

            // TypeScript правила (строгие)
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            // Отключено: требует parserOptions.project
            // '@typescript-eslint/consistent-type-exports': 'error',
            // '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': true,
                    'ts-nocheck': true,
                    'ts-check': false,
                    minimumDescriptionLength: 5
                }
            ],

            // Общие правила (строгие)
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-alert': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-expressions': 'error',
            'no-useless-return': 'error',
            'no-useless-concat': 'error',
            'no-useless-constructor': 'error',
            'no-else-return': ['error', { allowElseIf: false }],
            'prefer-template': 'error',
            'prefer-spread': 'error',
            'prefer-rest-params': 'error',
            'object-shorthand': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'curly': ['error', 'all'],
            'no-throw-literal': 'error',
            'no-return-await': 'error',
            'no-unused-vars': 'off',

            // Stylistic правила - отступы и форматирование
            '@stylistic/indent': [
                'error',
                4,
                {
                    SwitchCase: 1,
                    VariableDeclarator: 1,
                    outerIIFEBody: 1,
                    MemberExpression: 1,
                    FunctionDeclaration: { parameters: 1, body: 1 },
                    FunctionExpression: { parameters: 1, body: 1 },
                    CallExpression: { arguments: 1 },
                    ArrayExpression: 1,
                    ObjectExpression: 1,
                    ImportDeclaration: 1,
                    flatTernaryExpressions: false,
                    ignoredNodes: [
                        'TemplateLiteral *',
                        'JSXElement',
                        'JSXElement > *',
                        'JSXAttribute',
                        'JSXIdentifier',
                        'JSXNamespacedName',
                        'JSXMemberExpression',
                        'JSXSpreadAttribute',
                        'JSXExpressionContainer',
                        'JSXOpeningElement',
                        'JSXClosingElement',
                        'JSXFragment',
                        'JSXOpeningFragment',
                        'JSXClosingFragment',
                        'JSXText',
                        'JSXEmptyExpression',
                        'JSXSpreadChild',
                        'TSTypeParameterInstantiation'
                    ],
                    offsetTernaryExpressions: true
                }
            ],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/comma-dangle': [
                'error',
                {
                    arrays: 'never',
                    objects: 'never',
                    imports: 'never',
                    exports: 'never',
                    functions: 'never'
                }
            ],
            '@stylistic/comma-spacing': ['error', { before: false, after: true }],
            '@stylistic/comma-style': ['error', 'last'],
            '@stylistic/computed-property-spacing': ['error', 'never'],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/key-spacing': [
                'error',
                {
                    beforeColon: false,
                    afterColon: true,
                    mode: 'strict'
                }
            ],
            '@stylistic/keyword-spacing': [
                'error',
                {
                    before: true,
                    after: true
                }
            ],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/space-before-blocks': ['error', 'always'],
            '@stylistic/space-before-function-paren': [
                'error',
                {
                    anonymous: 'always',
                    named: 'never',
                    asyncArrow: 'always'
                }
            ],
            '@stylistic/space-in-parens': ['error', 'never'],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/space-unary-ops': [
                'error',
                {
                    words: true,
                    nonwords: false
                }
            ],
            '@stylistic/spaced-comment': [
                'error',
                'always',
                {
                    line: {
                        markers: ['/'],
                        exceptions: ['-', '=', '*']
                    },
                    block: {
                        markers: ['!'],
                        exceptions: ['*'],
                        balanced: true
                    }
                }
            ],
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
            '@stylistic/no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxEOF: 1,
                    maxBOF: 0
                }
            ],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/padded-blocks': ['error', 'never'],
            '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
            '@stylistic/block-spacing': ['error', 'always'],
            '@stylistic/arrow-parens': ['error', 'always'],
            // Отключено: конфликтует с Prettier
            // '@stylistic/no-extra-parens': ['error', 'all', { ignoreJSX: 'all', nestedBinaryExpressions: false }],
            '@stylistic/member-delimiter-style': [
                'error',
                {
                    multiline: {
                        delimiter: 'semi',
                        requireLast: true
                    },
                    singleline: {
                        delimiter: 'semi',
                        requireLast: false
                    }
                }
            ],
            // Отключено: конфликтует с Prettier
            // '@stylistic/type-annotation-spacing': ['error', { before: false, after: true }],

            // Качество кода
            '@stylistic/max-len': [
                'error',
                {
                    code: 120,
                    tabWidth: 4,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                    ignoreComments: false
                }
            ],
            'max-lines': [
                'error',
                {
                    max: 500,
                    skipBlankLines: true,
                    skipComments: true
                }
            ],
            'max-lines-per-function': [
                'error',
                {
                    max: 100,
                    skipBlankLines: true,
                    skipComments: true,
                    IIFEs: true
                }
            ],
            'complexity': ['error', 15],
            'max-depth': ['error', 4],
            'max-nested-callbacks': ['error', 3],
            'max-params': ['error', 5],

            // React специфичные правила
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off'
        }
    },

    // Настройки для JS файлов
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
        }
    }
);
