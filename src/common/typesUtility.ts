import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';
import { TSESTree } from '@typescript-eslint/typescript-estree/dist/ts-estree';
import { Type } from 'typescript';

export function getType(context: TSESLint.RuleContext<string, unknown[]>, node: TSESTree.Node): Type{
  const parserServices = ESLintUtils.getParserServices(context);
  const checker = parserServices.program.getTypeChecker();

  const originalNode = parserServices.esTreeNodeToTSNodeMap.get(
    node,
  );
  return checker.getTypeAtLocation(originalNode);
}
