import { AST_NODE_TYPES, ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { isSubString } from '../common/string';
import { getType } from '../common/typesUtility';

const createRule = ESLintUtils.RuleCreator(() => 'https://github.com/amaro0/eslint-plugin-ioc');
const INJECT_DECORATOR_REGEXP = /^(i|I)nject$/;

type MessageIds = 'injectionTokenIncorrectName' | 'incorrectInjectionToken' | 'classInjection';
type Options = [
  {
    injectionTokenNameRegex?: RegExp;
    allowClassInjection?: boolean;
    injectDecoratorRegex?: RegExp;
  },
];

type WithDefaultOptions = [
  {
    injectionTokenNameRegex?: RegExp;
    allowClassInjection: boolean;
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
      classInjection: 'Forbidden class injection',
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
          allowClassInjection: {
            type: 'boolean',
            default: true,
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
      allowClassInjection: true,
      // It is defaulted to /^(i|I)nject$/ but for some reason this is not working when i am placing regexp in here
      injectDecoratorRegex: undefined,
    },
  ],
  create(context: Readonly<TSESLint.RuleContext<MessageIds, WithDefaultOptions>>, [options]): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        function getInjectionToken(
          decorators: TSESTree.Decorator[],
          decoratorNameRegex?: RegExp,
        ): TSESTree.Identifier | undefined {
          let token: TSESTree.Identifier | undefined;
          const regex = decoratorNameRegex ?? INJECT_DECORATOR_REGEXP;
          decorators.forEach((decorator) => {
            if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) return;

            const { callee, arguments: args } = decorator.expression;

            if (callee.type !== AST_NODE_TYPES.Identifier) return;

            if (args.length && regex.test(callee.name)) {
              if (args[0].type !== AST_NODE_TYPES.Identifier) return;
              token = args[0];
            }
          });

          return token;
        }

        // const options = context.options[0] ?? {};
        const { injectionTokenNameRegex, allowClassInjection, injectDecoratorRegex } = options;

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

        const parameterInjectedToType = getType(context, parameterInjectedToTypeReference);
        if (!allowClassInjection && parameterInjectedToType.isClass()) {
          context.report({
            messageId: 'classInjection',
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
