# import required libraries
import numpy as np
import scipy.optimize as opt
from sklearn import datasets

# load binary iris dataset
def load_iris_binary():
    data, label = datasets.load_iris()['data'].T, datasets.load_iris()['target']
    data = data[:, label != 0]
    label = label[label != 0]
    label[label == 2] = 0
    return data, label

# split the data into 2:1 train-test ratio
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

# define the objective function for logistic regression
def logreg_obj(v, data, label, lambda_):
    d, n = data.shape
    w, b = v[0:-1], v[-1]
    z = np.dot(w.T, data) + b
    label[label == 0] = -1
    loss = np.logaddexp(0, -label * z)
    reg = (lambda_ / 2) * np.sum(w**2)
    J = (1.0/n)*np.sum(loss) + reg
    return J

if __name__ == '__main__':
    # load data and split into train and test sets
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    
    # train the logistic regression model using L-BFGS-B optimization
    data_train_centered = data_train - np.mean(data_train, axis=1).reshape((-1,1))
    d, n = data_train.shape
    x0_iris_train = np.zeros(d+1)
    lambda_ = 1
    x_opt, f_opt, info = opt.fmin_l_bfgs_b(logreg_obj, x0_iris_train, args=(data_train_centered, label_train, lambda_), iprint=1, approx_grad=True)
    
    # evaluate the model on the test set
    data_test_centered = data_test - np.mean(data_test, axis=1).reshape((-1,1))
    w_pred, b_pred = x_opt[0:-1], x_opt[-1]
    z_pred = np.dot(w_pred.T, data_test_centered) + b_pred
    label_test[label_test == 0] = -1
    pred_test = np.sign(z_pred)
    accuracy = (pred_test == label_test).sum() * 1.0 / label_test.shape[0]
    err_rate = 1 - accuracy
    print('Error Rate: %.2f%%' % ( err_rate * 100))
