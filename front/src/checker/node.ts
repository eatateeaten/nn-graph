/**
 * TypeScript port of the Python shape-checking graph.
 * 
 * Key implementation notes:
 * - Shape = number[] (equivalent to Python List[int])
 * - Uses TypeScript classes instead of Python ABC
 * - Each node must implement:
 *     1. compute_out_shape(in_shape: Shape): Shape
 *     2. validate_params(): void
 * 
 * The main difference is how output shapes work:
 * - out_shape is only recomputed when inputs or params change
 * - we raise an error if the shape doesn't match the next node's input shape
 *      UI is expected to disconnect the nodes in this case
 * - compute_out_shape() is pure - just takes in_shape & params and returns result
 * - update_out_shape() handles the caching and error handling
 * - so in that sense I assumed the left to right building thingy
 */

import { Shape } from './shape';

// Error types for different failure cases
export class ShapeError extends Error {}
export class ValidationError extends Error {}
export class ConnectionError extends Error {}

export interface NodeParams {
    [key: string]: any;
}

export type ParamFieldMetadata = {
    label: string;
    description: string;
    type: 'shape' | 'number' | 'option';
    allowNegativeOne?: boolean;
    options?: string[];
}

export type NodeMetadata<T extends NodeParams = NodeParams> = {
    label: string;
    description: string;
    category: 'basic' | 'convolution' | 'pooling' | 'activation';
    paramFields: {
        [K in keyof T]: ParamFieldMetadata;
    };
}

export abstract class CheckerNode<T extends NodeParams = NodeParams> {
    static readonly description: string = '';
    static readonly type: string;
    
    static getMeta(): NodeMetadata {
        throw new Error('getMeta() not implemented');
    }

    in_shape: Shape | null = null;
    out_shape: Shape | null = null;
    in_node: CheckerNode<any> | null = null;
    out_node: CheckerNode<any> | null = null;
    params: T;

    constructor(params: T) {
        this.params = params;
        this.validate_params();
        this.update_out_shape();
    }

    abstract compute_out_shape(in_shape: Shape): Shape;
    abstract validate_params(): void;

    // Rest of the methods remain largely the same
    protected update_out_shape(): void {
        if (this.in_shape === null) {
            this.out_shape = null;
            return;
        }

        try {
            this.out_shape = this.compute_out_shape(this.in_shape);
        } catch (e) {
            throw new ShapeError(`Output shape computation failed: ${e instanceof Error ? e.message : String(e)}`);
        }

        if (this.out_node && !this.out_shape.equals(this.out_node.in_shape)) {
            throw new ConnectionError(
                `Output shape mismatch with subsequent input shape: ${this.out_shape} vs ${this.out_node.in_shape}`
            );
        }
    }

    set_params(params: T): void {
        this.params = params;
        try {
            this.validate_params();
        } catch (e) {
            throw new ValidationError(`Parameter validation failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        this.update_out_shape();
    }

    connect_to(target: CheckerNode<any>): void {
        if (target.in_shape !== null) {
            if (!this.out_shape?.equals(target.in_shape)) {
                throw new ConnectionError(
                    `Input shape mismatch: cannot connect output shape ${this.out_shape} to input shape ${target.in_shape}`
                );
            }
        } else {
            target.set_in_shape(this.out_shape);
        }
        this.out_node = target;
        target.in_node = this;
    }

    set_in_shape(shape: Shape | null): void {
        this.in_shape = shape;
        this.update_out_shape();
    }
}
