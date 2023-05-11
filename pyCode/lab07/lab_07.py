import numpy as np
import scipy.optimize as opt
from sklearn import datasets

def load_iris_binary():
    data, label = datasets.load_iris()['data'].T, datasets.load_iris()['target']
    data = data[:, label != 0]
    label = label[label != 0]
    label[label == 2] = 0
    return data, label

def split_data_2to1(data, label, seed=0):
    n_train = int(data.shape[1] * 1.0/2.0)
    np.random.seed(seed)
    index = np.random.permutation(data.shape[1])
    index_train = index[:n_train]
    index_test = index[n_train:]

    data_train = data[:, index_train]
    label_train = label[index_train]
    data_test = data[:, index_test]
    label_test = label[index_test]
    
    return (data_train, label_train), (data_test, label_test)

def function_to_solve(x):
    return (x[0]+3)**2 + np.sin(x[0]) + (x[1]+1)**2

def gradient_to_solve(x):
    return [2*(x[0]+3) + np.cos(x[0]), 2*(x[1]+1)]

def gradient_approximation(x, h=1e-7):
    gradient_approx = []
    for i in range (len(x)):
        x_plus_h = x.copy()
        x_plus_h[i] += h
        gradient_approx.append((function_to_solve(x_plus_h) - function_to_solve(x))/h)
    return gradient_approx

#def logreg_obj (x, data, label, lambda_):

if __name__ == '__main__':
    x0 = [0, 0]
    res_with_approx_grad = opt.fmin_l_bfgs_b(function_to_solve, x0, approx_grad=True)
    res_with_calculated_grad = opt.fmin_l_bfgs_b(function_to_solve, x0, approx_grad=False, fprime=gradient_to_solve)
    
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)