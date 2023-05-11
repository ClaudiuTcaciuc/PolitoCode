import numpy as np
import scipy.optimize as opt
from sklearn import datasets
#test
from sklearn.metrics import accuracy_score

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

def sigmoid (z):
    return 1/(1 + np.exp(-z))

def logreg_obj (v, data, label, lambda_):
    d, n = data.shape
    v = v.reshape((d+1, 1))
    data = np.vstack((np.ones((1, n)), data))
    z = np.dot(v.T, data)
    J = lambda_/2 * np.dot(v.T, v) + (1.0/n)*np.sum(np.logaddexp(0, -label*z))
    return J

def logreg_obj_v2(v, data, label, lambda_):
    d, n = data.shape
    w, b = v[0:-1].reshape((d,1)), v[-1]
    z = np.dot(w.T, data) + b
    loss = np.logaddexp(0, -label * z)
    reg = lambda_ / 2 * np.dot(w.T, w)
    J = np.sum(loss) / n + reg
    print(f"J: {J}")
    return J

if __name__ == '__main__':
    # initial guess
    x0_test = [0, 0]
    res_with_approx_grad = opt.fmin_l_bfgs_b(function_to_solve, x0_test, approx_grad=True)
    res_with_calculated_grad = opt.fmin_l_bfgs_b(function_to_solve, x0_test, approx_grad=False, fprime=gradient_to_solve)
    #print(res_with_approx_grad)
    # load data
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    data_train_centered = (data_train - np.mean(data_train, axis=1).reshape(-1, 1))/np.std(data_train, axis=1).reshape(-1, 1)
    # test gradient approximation
    x0_iris = np.zeros(data_train.shape[0] + 1)
    res_iris = opt.fmin_l_bfgs_b(logreg_obj_v2, x0_iris, args=(data_train_centered, label_train, 1e-6), approx_grad=True, iprint=0)
    print(f"res_iris with approx_grad:\n{res_iris}")
    