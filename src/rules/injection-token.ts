import { AST_NODE_TYPES, ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

import { isSubString } from '../common/string';
import { getType } from '../common/typesUtility';

const createRule = ESLintUtils.RuleCreator(
  name => `https://example.com/rule/${name}`,
);

const INJECT_DECORATOR_REGEXP = /(i|I)nject/;

function getInjectionToken(decorators: TSESTree.Decorator[]): TSESTree.Identifier | undefined {
  let injectionToken: TSESTree.Identifier | undefined;
  decorators.forEach(decorator => {
    if (decorator.expression.type !== AST_NODE_TYPES.CallExpression) return;

    const { callee, arguments: args } = decorator.expression;

    if (callee.type !== AST_NODE_TYPES.Identifier) return;

    if (args.length && INJECT_DECORATOR_REGEXP.test(callee.name)) {
      if (args[0].type !== AST_NODE_TYPES.Identifier) return;
      injectionToken = args[0];
    }
  });

  return injectionToken;
}

type MessageIds = 'injectionTokenIncorrectName' | 'incorrectInjectionToken' | 'classInjection';
type Options = [
  {
    injectionTokenNameRegex?: RegExp;
    allowClassInjection?: boolean;
  },
];

export const injectionToken: TSESLint.RuleModule<MessageIds, Options> = createRule({
  name: 'injection-token',
  meta: {
    type: 'problem',
    messages: {
      incorrectInjectionToken: 'a message',
      injectionTokenIncorrectName: '123',
      classInjection: 'Forbidden class injection',
    },
    schema: [
      {
        type: 'object',
        properties: {
          injectionTokenNameRegex: {
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
  defaultOptions: [{
    injectionTokenNameRegex: undefined,
    allowClassInjection: true,
  }],
  create(context: Readonly<TSESLint.RuleContext<MessageIds, Options>>): TSESLint.RuleListener {
    return {
      TSParameterProperty(parameterProperty: TSESTree.TSParameterProperty): void {
        const options = context.options[0] ?? {};
        const { injectionTokenNameRegex, allowClassInjection } = options;
        const { decorators, parameter } = parameterProperty;

        if (!decorators || !decorators.length) return;

        const injectionToken: TSESTree.Identifier | undefined = getInjectionToken(decorators);
        if (!injectionToken) return;

        const injectionTokenName = injectionToken.name;

        if (!parameter.typeAnnotation
          || parameter.typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) return;
        const parameterInjectedToTypeReference = <TSESTree.TSTypeReference>parameter.typeAnnotation.typeAnnotation;

        if (parameterInjectedToTypeReference.typeName.type !== AST_NODE_TYPES.Identifier) return;
        const injectionTypeName = parameterInjectedToTypeReference.typeName.name;

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

        const parameterInjectedToType = getType(context, parameterInjectedToTypeReference);
        if (parameterInjectedToType.isClass() && !allowClassInjection) {
          context.report({
            messageId: 'classInjection',
            node: injectionToken,
          });
        }
      },
    };
  },
});
