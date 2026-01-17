import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
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
                project: './tsconfig.app.json',
                tsconfigRootDir: import.meta.dirname
            }
        },
        plugins: {
            'react': react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@stylistic': stylistic
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // React Hooks правила
            ...reactHooks.configs.recommended.rules,
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react-refresh/only-export-components': ['error', { allowConstantExport: true }],

            // ============================================
            // TypeScript правила (МАКСИМАЛЬНАЯ СТРОГОСТЬ)
            // ============================================
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': true,
                    'ts-nocheck': true,
                    'ts-check': false,
                    minimumDescriptionLength: 10
                }
            ],

            // Правила, работающие БЕЗ type-checking (максимальная строгость)
            '@typescript-eslint/no-meaningless-void-operator': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false }],
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/prefer-includes': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-dynamic-delete': 'error',
            '@typescript-eslint/no-extraneous-class': ['error', { allowConstructorOnly: false, allowEmpty: false, allowStaticOnly: false }],
            '@typescript-eslint/no-for-in-array': 'error',
            '@typescript-eslint/no-implied-eval': 'error',
            '@typescript-eslint/no-loop-func': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'error',
            '@typescript-eslint/no-unnecessary-qualifier': 'error',
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            '@typescript-eslint/no-useless-empty-export': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/prefer-literal-enum-member': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            '@typescript-eslint/prefer-regexp-exec': 'error',
            '@typescript-eslint/prefer-ts-expect-error': 'error',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/triple-slash-reference': 'error',
            '@typescript-eslint/unified-signatures': 'error',
            '@typescript-eslint/no-base-to-string': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
            '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'as',
                    objectLiteralTypeAssertions: 'never'
                }
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'typeLike',
                    format: ['PascalCase']
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase']
                },
                {
                    selector: 'parameter',
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow'
                }
            ],
            '@typescript-eslint/no-array-constructor': 'error',
            '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: false }],
            '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: false, ignoreProperties: false }],
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': ['error', { allowDeclarations: false, allowDefinitionFiles: false }],
            '@typescript-eslint/no-this-alias': ['error', { allowedNames: ['self'] }],
            '@typescript-eslint/no-unused-expressions': 'off', // Используется базовое правило
            '@typescript-eslint/no-useless-empty-export': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',

            // Правила, требующие type-checking (ВКЛЮЧЕНЫ)
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/strict-boolean-expressions': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/restrict-template-expressions': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',

            // ============================================
            // Общие правила (МАКСИМАЛЬНАЯ СТРОГОСТЬ)
            // ============================================
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-alert': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-expressions': ['error', { allowShortCircuit: false, allowTernary: false, allowTaggedTemplates: false }],
            'no-useless-return': 'error',
            'no-useless-concat': 'error',
            'no-useless-constructor': 'error',
            'no-else-return': ['error', { allowElseIf: false }],
            'prefer-template': 'error',
            'prefer-spread': 'error',
            'prefer-rest-params': 'error',
            'object-shorthand': ['error', 'always', { avoidQuotes: true }],
            'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'curly': ['error', 'all'],
            'no-throw-literal': 'error',
            'no-return-await': 'error',
            'no-unused-vars': 'off',

            // Безопасность (критически важно)
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',
            'no-proto': 'error',
            'no-iterator': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'CallExpression[callee.name="eval"]',
                    message: 'eval() запрещен из соображений безопасности'
                },
                {
                    selector: 'CallExpression[callee.name="Function"]',
                    message: 'Function() конструктор запрещен из соображений безопасности'
                }
            ],

            // Качество кода - предотвращение ошибок
            'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['acc', 'accumulator', 'e', 'ctx', 'context', 'req', 'request', 'res', 'response', '$scope', 'staticContext'] }],
            'no-return-assign': ['error', 'always'],
            'no-sequences': 'error',
            'no-unmodified-loop-condition': 'error',
            'no-unreachable-loop': 'error',
            'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
            'no-shadow': ['error', { builtinGlobals: true, hoist: 'all', allow: ['resolve', 'reject', 'done', 'next', 'err', 'error'] }],
            'no-shadow-restricted-names': 'error',
            'no-undef': 'error',
            'no-undef-init': 'error',
            'no-undefined': 'error',
            'no-unreachable': 'error',
            'no-unused-labels': 'error',
            'no-useless-call': 'error',
            'no-useless-catch': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-rename': 'error',
            'no-void': ['error', { allowAsStatement: false }],
            'no-with': 'error',
            'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
            'prefer-named-capture-group': 'error',
            'prefer-promise-reject-errors': ['error', { allowEmptyReject: false }],
            'require-atomic-updates': 'error',
            'require-await': 'error',
            'yoda': ['error', 'never', { exceptRange: false }],

            // Производительность
            'no-await-in-loop': 'error',
            'no-caller': 'error',
            'no-continue': 'off', // Разрешено для читаемости
            'no-empty-function': ['error', { allow: ['arrowFunctions', 'functions', 'methods'] }],
            'no-extra-bind': 'error',
            'no-extra-label': 'error',
            'no-implicit-coercion': ['error', { boolean: true, number: true, string: true, disallowTemplateShorthand: false }],
            'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
            'no-lone-blocks': 'error',
            'no-loop-func': 'error',
            'no-multi-assign': 'error',
            'no-new': 'error',
            'no-new-wrappers': 'error',
            'no-octal-escape': 'error',
            'no-return-assign': ['error', 'always'],
            'no-self-compare': 'error',
            'no-ternary': 'off', // Разрешено для читаемости
            'no-throw-literal': 'error',
            'no-unneeded-ternary': ['error', { defaultAssignment: false }],
            'no-useless-assignment': 'error',
            'prefer-exponentiation-operator': 'error',
            'prefer-object-has-own': 'error',
            'radix': ['error', 'always'],

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

            // ============================================
            // React правила (МАКСИМАЛЬНАЯ СТРОГОСТЬ)
            // ============================================
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
            'react/jsx-no-useless-fragment': ['error', { allowExpressions: false }],
            'react/jsx-pascal-case': ['error', { allowAllCaps: false, ignore: [] }],
            'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],
            'react/jsx-no-undef': 'error',
            'react/jsx-uses-vars': 'error',
            'react/no-array-index-key': 'error',
            'react/no-children-prop': 'error',
            'react/no-danger': 'error',
            'react/no-danger-with-children': 'error',
            'react/no-deprecated': 'error',
            'react/no-direct-mutation-state': 'error',
            'react/no-find-dom-node': 'error',
            'react/no-is-mounted': 'error',
            'react/no-render-return-value': 'error',
            'react/no-string-refs': 'error',
            'react/no-unescaped-entities': 'error',
            'react/no-unknown-property': 'error',
            'react/no-unsafe': ['error', { checkAliases: true }],
            'react/require-render-return': 'error',
            'react/self-closing-comp': ['error', { component: true, html: true }],
            'react/void-dom-elements-no-children': 'error',
            'react/jsx-boolean-value': ['error', 'never'],
            'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
            'react/jsx-fragments': ['error', 'syntax'],
            'react/jsx-no-comment-textnodes': 'error',
            'react/jsx-no-constructed-context-values': 'error',
            'react/jsx-no-script-url': 'error',
            'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
            'react/jsx-no-undef': 'error',
            'react/jsx-props-no-multi-spaces': 'error',
            'react/jsx-tag-spacing': ['error', { closingSlash: 'never', beforeSelfClosing: 'always', afterOpening: 'never', beforeClosing: 'never' }],

            // ============================================
            // Дополнительные правила качества
            // ============================================
            'array-callback-return': ['error', { allowImplicit: false, checkForEach: true }],
            'consistent-return': ['error', { treatUndefinedAsUnspecified: true }],
            'default-case': ['error', { commentPattern: '^no default$' }],
            'default-case-last': 'error',
            'dot-notation': ['error', { allowKeywords: true, allowPattern: '' }],
            'grouped-accessor-pairs': ['error', 'getBeforeSet'],
            'guard-for-in': 'error',
            'no-array-constructor': 'error',
            'no-bitwise': ['error', { allow: [], int32Hint: false }],
            'no-caller': 'error',
            'no-case-declarations': 'error',
            'no-constructor-return': 'error',
            'no-div-regex': 'error',
            'no-empty-pattern': 'error',
            'no-fallthrough': 'error',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-inner-declarations': ['error', 'functions'],
            'no-invalid-regexp': ['error', { allowConstructorFlags: [] }],
            'no-irregular-whitespace': ['error', { skipStrings: false, skipComments: false, skipRegExps: false, skipTemplates: false }],
            'no-loss-of-precision': 'error',
            'no-nonoctal-decimal-escape': 'error',
            'no-obj-calls': 'error',
            'no-octal': 'error',
            'no-prototype-builtins': 'error',
            'no-redeclare': ['error', { builtinGlobals: true }],
            'no-regex-spaces': 'error',
            'no-restricted-globals': [
                'error',
                {
                    name: 'event',
                    message: 'Используйте параметр события вместо глобального event'
                },
                {
                    name: 'fdescribe',
                    message: 'Не используйте fdescribe. Используйте describe.'
                }
            ],
            'no-self-assign': ['error', { props: true }],
            'no-setter-return': 'error',
            'no-sparse-arrays': 'error',
            'no-template-curly-in-string': 'error',
            'no-unexpected-multiline': 'error',
            'valid-typeof': ['error', { requireStringLiterals: true }]
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
