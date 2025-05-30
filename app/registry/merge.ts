import { ModuleMetadata } from './types';

export const mergeModules: Record<string, ModuleMetadata> = {
    'Concat': {
        label: 'Concat',
        description: 'Concatenates multiple tensors along a specified dimension',
        category: 'Flow',
        paramFields: {
            dim: {
                label: 'Dimension',
                description: 'Dimension along which to concatenate the tensors',
                type: 'number',
                default: 0
            },
            numberOfMerges: {
                label: 'Number of Inputs',
                description: 'Number of tensors to combine',
                type: 'number',
                default: 2
            }
        }
    },
    'PointwiseReduce': {
        label: 'Pointwise Reduce',
        description: 'Combines multiple tensors using an element-wise operation',
        category: 'Flow',
        paramFields: {
            opType: {
                label: 'Operation',
                description: 'The type of reduction operation to perform',
                type: 'option',
                default: 'add',
                options: ['add', 'multiply', 'maximum', 'minimum']
            },
            numberOfMerges: {
                label: 'Number of Inputs',
                description: 'Number of tensors to combine',
                type: 'number',
                default: 2
            }
        }
    },
    'DotOp': {
        label: 'Dot Product',
        description: 'Performs dot product (matrix multiplication) between two tensors',
        category: 'Math',
        paramFields: {
        }
    },
    'CrossOp': {
        label: 'Cross Product',
        description: 'Computes the cross product of two 3-dimensional vectors',
        category: 'Math',
        paramFields: {
        }
    }
};
