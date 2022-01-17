import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { getInjectionToken } from '../common/injectDecorator';
import { getType, isObject, isString, isSymbol } from '../common/typesUtility';

const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/amaro0/eslint-plugin-ioc');

type InjectionTokenType = 'string' | 'object' | 'symbol';
type MessageIds = 'notAllowedInjectionTokenType';
type Options = [
  {
    allowedTypes: InjectionTokenType[],
    injectDecoratorRegex?: RegExp
  },
];

export const injectionTokenType: TSESLint.RuleModule<MessageIds, Options> = createRule({
  name: 'injection-token-type',
  meta: {
    type: 'problem',
    messages: {
      notAllowedInjectionTokenType: 'Not allowed injection token type',
    },
    schema: [
      {
        type: 'object',
        properties: {
          injectDecoratorRegex: {
            type: 'object',
          },
          allowedTypes: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['symbol'],
          },
        },
        additionalProperties: false,
      },
    ],
    docs: {
      description: '',
      recommended: 'error',
      requiresTypeChecking: true,
      extendsBaseRule: false,
    },
  },
  defaultOptions: [
    {
      allowedTypes: ['symbol'],
      // It is defaulted to /^(i|I)nject$/ but for some reason this is not working when i am placing regexp in here
      injectDecoratorRegex: undefined,
    },
  ],
  create(context: Readonly<TSESLint.RuleContext<MessageIds, Options>>, [options]): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        const { injectDecoratorRegex, allowedTypes } = options;

        const { decorators } = parameterProperty;

        if (!decorators || !decorators.length) return;

        const iToken: TSESTree.Identifier | undefined = getInjectionToken(decorators, injectDecoratorRegex);
        if (!iToken) return;

        const type = getType(context, iToken);

        if (isSymbol(type) && allowedTypes.includes('symbol')) return;
        if (isString(type) && allowedTypes.includes('string')) return;
        if (isObject(type) && allowedTypes.includes('object')) return;

        context.report({
          messageId: 'notAllowedInjectionTokenType',
          node: iToken,
        });
      },
    };
  },
});
