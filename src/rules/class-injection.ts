import { AST_NODE_TYPES, ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { getInjectionToken } from '../common/injectDecorator';
import { getType } from '../common/typesUtility';

const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/amaro0/eslint-plugin-ioc');

type MessageIds = 'classInjection';
type Options = [
  {
    injectDecoratorRegex?: RegExp;
  },
];

type WithDefaultOptions = [
  {
    injectDecoratorRegex?: RegExp;
  },
];

export const classInjection: TSESLint.RuleModule<MessageIds, Options> = createRule({
  name: 'class-injection',
  meta: {
    type: 'problem',
    messages: {
      classInjection: 'Forbidden class injection',
    },
    schema: [
      {
        type: 'object',
        properties: {
          injectDecoratorRegex: {
            type: 'object',
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
      // It is defaulted to /^(i|I)nject$/ but for some reason this is not working when i am placing regexp in here
      injectDecoratorRegex: undefined,
    },
  ],
  create(context: Readonly<TSESLint.RuleContext<MessageIds, WithDefaultOptions>>, [options]): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        const { injectDecoratorRegex } = options;

        const { decorators, parameter } = parameterProperty;

        if (!decorators || !decorators.length) return;

        const iToken: TSESTree.Identifier | undefined = getInjectionToken(decorators, injectDecoratorRegex);
        if (!iToken) return;

        if (
          !parameter.typeAnnotation ||
          parameter.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference
        )
          return;
        const parameterInjectedToTypeReference = <TSESTree.TSTypeReference>parameter.typeAnnotation.typeAnnotation;

        if (parameterInjectedToTypeReference.typeName.type !== AST_NODE_TYPES.Identifier) return;

        const parameterInjectedToType = getType(context, parameterInjectedToTypeReference);
        if (parameterInjectedToType.isClass()) {
          context.report({
            messageId: 'classInjection',
            node: iToken,
          });
        }
      },
    };
  },
});
