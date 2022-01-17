import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';

const INJECT_DECORATOR_REGEXP = /^(i|I)nject$/;

export function getInjectionToken(
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
