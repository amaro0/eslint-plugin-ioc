import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';
import { TSESTree } from '@typescript-eslint/typescript-estree/dist/ts-estree';
import { Node, Type, TypeFlags } from 'typescript';

export function getType(context: TSESLint.RuleContext<string, unknown[]>, node: TSESTree.Node): Type {
  const parserServices = ESLintUtils.getParserServices(context);
  const checker = parserServices.program.getTypeChecker();

  const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
  return checker.getTypeAtLocation(originalNode);
}

export function getNode(context: TSESLint.RuleContext<string, unknown[]>, node: TSESTree.Node): Node {
  const parserServices = ESLintUtils.getParserServices(context);

  return parserServices.esTreeNodeToTSNodeMap.get(node);
}

export function isSymbol(type: Type): boolean {
  const flags = type.getFlags();

  return flags.valueOf() === TypeFlags.ESSymbol
    || flags.valueOf() === TypeFlags.UniqueESSymbol
    || flags.valueOf() === TypeFlags.ESSymbolLike;
}


export function isString(type: Type): boolean {
  const flags = type.getFlags();

  return flags.valueOf() === TypeFlags.String
    || flags.valueOf() === TypeFlags.StringLiteral
    || flags.valueOf() === TypeFlags.StringLike;
}

export function isObject(type: Type): boolean {
  const flags = type.getFlags();

  return flags.valueOf() === TypeFlags.Object;
}
