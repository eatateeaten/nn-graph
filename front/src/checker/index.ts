// Export shape types and utilities
export type { Shape } from './shape';

// Export graph
export { CheckerGraph } from './graph';

// Import all node types
import { type UtilNodeParams, UtilNodes } from './utils';
import { type ConvNodeParams, ConvNodes } from './conv';
import { CheckerNode, NodeMetadata, NodeParams } from './node';

// Combine all node params into a single type
export type CheckerNodeParams = UtilNodeParams[keyof UtilNodeParams] | ConvNodeParams[keyof ConvNodeParams];
export type CheckerNodeType = keyof (UtilNodeParams & ConvNodeParams);

// Create a type for the node constructors
type CheckerNodeConstructor<T extends CheckerNodeType> = {
    new (params: CheckerNodeParams[T]): CheckerNode<CheckerNodeParams[T]>;
    getMeta(): NodeMetadata<CheckerNodeParams[T]>;
    validateParams(params: NodeParams): string | null;
};

// Combine all node constructors into a single record
export const CheckerNodes: { [T in CheckerNodeType]: CheckerNodeConstructor<T> } = {
    ...UtilNodes,
    ...ConvNodes,
} as const;

export type CheckerNodeConfig<T extends CheckerNodeType = CheckerNodeType> = { 
    type: T; 
    params: CheckerNodeParams[T];
};

export function createCheckerNode<T extends CheckerNodeType>(config: CheckerNodeConfig<T>): CheckerNode<CheckerNodeParams[T]> {
    const NodeClass = CheckerNodes[config.type];
    return new NodeClass(config.params);
}

export { CheckerNode };
