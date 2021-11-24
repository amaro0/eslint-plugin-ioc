import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { isSubString } from '../common/string';

const INJECT_DECORATOR_REGEXP = /(i|I)nject/;

type MessageIds = 'injectionTokenIncorrectName' | 'incorrectInjectionToken';
type Options = [
  {
    injectionTokenNameRegex?: RegExp;
    // allowClassInjection?: boolean;
  },
];

export const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    messages: {
      incorrectInjectionToken: 'a message',
      injectionTokenIncorrectName: '123',
    },
    schema: [
      {
        type: 'object',
        properties: {
          injectionTokenNameRegex: {
            type: 'object',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: Readonly<TSESLint.RuleContext<MessageIds, Options>>): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        const options = context.options[0] ?? {};
        const { injectionTokenNameRegex } = options;
        const { decorators, parameter } = parameterProperty;

        if (!decorators || !decorators.length) return;

        let injectionTokenName: string | undefined;
        let injectionToken: TSESTree.Identifier | undefined;
        decorators.forEach(decorator => {
          if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) return;

          const { callee, arguments: args } = decorator.expression;

          if (callee.type !== AST_NODE_TYPES.Identifier) return;

          if (args.length && INJECT_DECORATOR_REGEXP.test(callee.name)) {
            if (args[0].type !== AST_NODE_TYPES.Identifier) return;
            injectionTokenName = args[0].name;
            injectionToken = args[0];
          }
        });

        if (!injectionTokenName || !injectionToken) return;
        if (!parameter.typeAnnotation) return;
        if (parameter.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) return;
        const typeRef = <TSESTree.TSTypeReference>parameter.typeAnnotation.typeAnnotation;

        if (typeRef.typeName.type !== AST_NODE_TYPES.Identifier) return;
        const injectionTypeName = typeRef.typeName.name;

        if (!isSubString(injectionTokenName, injectionTypeName)) {
          context.report({
            messageId: 'incorrectInjectionToken',
            node: injectionToken,
          });
        }
        if (injectionTokenNameRegex && !injectionTokenNameRegex.test(injectionTokenName)) {
          context.report({
            messageId: 'injectionTokenIncorrectName',
            node: injectionToken,
          });
        }
      },
    };
  },
};
