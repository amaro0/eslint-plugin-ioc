import { AST_NODE_TYPES, ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { getInjectionToken } from '../common/injectDecorator';
import { isSubString } from '../common/string';

const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/amaro0/eslint-plugin-ioc');

type MessageIds = 'injectionTokenIncorrectName' | 'incorrectInjectionToken';
type Options = [
  {
    injectionTokenNameRegex?: RegExp;
    injectDecoratorRegex?: RegExp;
  },
];

type WithDefaultOptions = [
  {
    injectionTokenNameRegex?: RegExp;
    injectDecoratorRegex?: RegExp;
  },
];

export const injectionToken: TSESLint.RuleModule<MessageIds, Options> = createRule({
  name: 'injection-token',
  meta: {
    type: 'problem',
    messages: {
      incorrectInjectionToken: 'Incorrect injection token',
      injectionTokenIncorrectName: 'Incorrect name format of injection token',
    },
    schema: [
      {
        type: 'object',
        properties: {
          injectionTokenNameRegex: {
            type: 'object',
          },
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
      injectionTokenNameRegex: undefined,
      // It is defaulted to /^(i|I)nject$/ but for some reason this is not working when i am placing regexp in here
      injectDecoratorRegex: undefined,
    },
  ],
  create(context: Readonly<TSESLint.RuleContext<MessageIds, WithDefaultOptions>>, [options]): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        const { injectionTokenNameRegex, injectDecoratorRegex } = options;

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
        const injectionTypeName = parameterInjectedToTypeReference.typeName.name;
        const gotSomeGenericParameters = !!parameterInjectedToTypeReference.typeParameters?.params.length;

        if (injectionTokenNameRegex && !injectionTokenNameRegex.test(iToken.name)) {
          context.report({
            messageId: 'injectionTokenIncorrectName',
            node: iToken,
          });
        }

        if (!gotSomeGenericParameters && !isSubString(iToken.name, injectionTypeName)) {
          context.report({
            messageId: 'incorrectInjectionToken',
            node: iToken,
          });
        }
      },
    };
  },
});
