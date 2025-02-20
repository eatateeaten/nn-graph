from node import Node, Reshape, Tensor
import unittest
import torch
import tensorflow as tf
import numpy as np


#TODO Some notes to front-end: 
#the bubble sould only look green if a node has in_shape, out_shape, input_node and output_node all defined
#call .completed() to check


class TestNodeOperations(unittest.TestCase):
    def test_successful_reshape(self): 
        # Create a tensor with shape (3, 8, 3)
        data = torch.randn(3, 8, 3)
        tensor_node = Tensor(data)
        print(tensor_node.in_shape)
        print(tensor_node.out_shape)
        # Apply reshape (3, 4, -1)
        reshape_node1 = Reshape((3, 4, -1))
        reshape_node1.set_input_node(tensor_node)
        self.assertEqual(reshape_node1.out_shape, (3, 4, 6))

        # Apply reshape (3, -1, 2)
        reshape_node2 = Reshape((3, -1, 2))
        reshape_node2.set_input_node(reshape_node1)
        self.assertEqual(reshape_node2.out_shape, (3, 12, 2))

    def test_reshape_failure(self):
        # Create a tensor with shape (3, 8, 3)
        data = torch.randn(3, 8, 3)
        tensor_node = Tensor(data)

        # Attempt invalid reshape (3, 5, -1)
        reshape_node = Reshape((3, 5, -1))
        with self.assertRaises(ValueError) as context:
            reshape_node.set_input_node(tensor_node)
        self.assertIn("Cannot infer dimension", str(context.exception))

    def test_dimension_mismatch(self):
        # Create a tensor with shape (3, 8, 3)
        data = torch.randn(3, 8, 3)
        tensor_node = Tensor(data)

        # Apply valid reshape (3, 4, 6)
        reshape_node = Reshape((3, 4, 6))
        reshape_node.set_input_node(tensor_node)

        # Attempt to connect a tensor with a different shape
        different_tensor = Tensor(torch.randn(3, 10, 2))
        with self.assertRaises(ValueError) as context:
            reshape_node.set_output_node(different_tensor)
        self.assertIn("out_shape mismatch", str(context.exception))
    
    def test_swap_layer(self):
        # Create a tensor with shape (3, 8, 3)
        input = torch.randn(3, 8, 3)
        input_node = Tensor(input)
        
        # Apply reshape (3, 4, -1)
        reshape_node1 = Reshape((3, 4, -1))
        reshape_node1.set_input_node(input_node)
        self.assertEqual(reshape_node1.out_shape, (3, 4, 6))

        # Apply reshape (3, -1, 2)
        reshape_node2 = Reshape((3, -1, 2))
        reshape_node2.set_input_node(reshape_node1)
        self.assertEqual(reshape_node2.out_shape, (3, 12, 2))

        output = torch.randn(3, 12, 2)
        output_node = Tensor(output)
        output_node.set_input_node(reshape_node2) 

        # Now you have Input Tensor - Reshape(3, 4, -1) - Reshape(3, -1, 2) = Output Tensor 
        # We want to swap Reshape (3, 4, -1) to Reshape (3, 8, 2)
        reshape_node1_1 = Reshape((3, 8, 2))
        with self.assertRaises(ValueError) as context:
            reshape_node1_1.set_input_node(input_node) # cannot set input node here because you cannot reshape (3, 8, 3) to (3, 8, 2)
            reshape_node1_1.set_output_node(reshape_node2)
        self.assertIn("Failed to infer", str(context.exception))

        # Then we want to swap Reshape (3, 4, -1) to Reshape (3, 2, 12) this would be okay but we cannot reconnect anymore with the following layer
        reshape_node1_2 = Reshape((3, 2, 12))
        with self.assertRaises(ValueError) as context:
            reshape_node1_2.set_input_node(input_node) 
            reshape_node1_2.set_output_node(reshape_node2)
        self.assertIn("Invalid add node", str(context.exception)) 

        # Then we want to swap Reshape (3, 4, -1) to Reshape (3, 2, 12) this would be okay but we cannot reconnect anymore with the following layer
        reshape_node1_2 = Reshape((3, 2, 12))
        with self.assertRaises(ValueError) as context:
            reshape_node1_2.set_input_node(input_node) 
            reshape_node1_2.set_output_node(reshape_node2)
        self.assertIn("Invalid add node", str(context.exception))
        # This step would essentially invalidate all the downstream connections 

        # Next step I will try to assist inferring the reshapes  

        # We can however, swap Reshape (3, 4, -1) to Reshape (3, 4, 6) without any problem.
        # These are the steps 
        reshape_node1_2 = Reshape((3, 4, 6))
        reshape_node1_2.set_input_node(input_node) 
        reshape_node1_2.set_output_node(reshape_node2)
        # When you swap a layer, you should call these three steps. Catch the error to determine whether the layer inference is invalid or the output shape is not matching

        

if __name__ == '__main__':
    unittest.main()



