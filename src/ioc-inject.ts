import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

const INJECT_DECORATOR_REGEXP = /(i|I)nject/;
const INJECTION_TOKEN_REGEXP = /^[A-Za-z]*Token$/;

type MessageIds = 'injectionTokenIncorrectName' | 'incorrectInjectionToken';

export const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    schema: [],
    type: 'problem',
    messages: {
      incorrectInjectionToken: 'a message',
      injectionTokenIncorrectName: '123',
    },
  },
  create(context: Readonly<TSESLint.RuleContext<MessageIds, []>>): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
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
        if (!INJECTION_TOKEN_REGEXP.test(injectionTokenName)) {
          context.report({
            messageId: 'injectionTokenIncorrectName',
            node: injectionToken,
          });
        }

        if (!parameter.typeAnnotation) return;
        if (parameter.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) return;
        const typeRef = <TSESTree.TSTypeReference>parameter.typeAnnotation.typeAnnotation;

        if (typeRef.typeName.type !== AST_NODE_TYPES.Identifier) return;
        const injectionTypeName = typeRef.typeName.name;

        if (`${injectionTypeName}Token` !== injectionTokenName && injectionTypeName !== injectionTokenName) {
          context.report({
            messageId: 'incorrectInjectionToken',
            node: injectionToken,
          });
        }
      },
    };
  },
};
