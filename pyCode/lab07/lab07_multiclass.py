# import required libraries
import numpy as np
import scipy.optimize as opt
from sklearn import datasets

# load binary iris dataset
def load_iris():
    data, label = datasets.load_iris()['data'].T, datasets.load_iris()['target']
    return data, label

# split the data into 2:1 train-test ratio
def split_data_2to1(data, label, seed=0):
    n_train = int(data.shape[1] * 2.0/3.0)
    np.random.seed(seed)
    index = np.random.permutation(data.shape[1])
    index_train = index[:n_train]
    index_test = index[n_train:]

    data_train = data[:, index_train]
    label_train = label[index_train]
    data_test = data[:, index_test]
    label_test = label[index_test]
    
    return (data_train, label_train), (data_test, label_test)

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

# define the objective function for logistic regression
def logreg_obj_multiclass(v, data, label, lambda_, K=3):
    d, n = data.shape
    w = v[0:d*K].reshape((d, K))
    b = v[d*K:].reshape((K, 1))
    z = np.dot(w.T, data) + b
    exp_z = np.exp(z)
    probs = exp_z / np.sum(exp_z, axis=0)
    log_probs = np.log(probs)
    error = -np.sum(log_probs[label, np.arange(n)])
    reg = (lambda_ / 2 ) * np.sum(w**2)
    J = (1.0/n)*error + reg
    return J

if __name__ == '__main__':
    # load data and split into train and test sets
    data, label = load_iris()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    
    # train the logistic regression model using L-BFGS-B optimization
    K = 3
    data_train_centered = data_train - np.mean(data_train, axis=1).reshape((-1,1))
    d, n = data_train.shape
    x0_iris_train = np.zeros( d*K+K )
    lambda_ = 1
    
    x_opt, f_opt, info = opt.fmin_l_bfgs_b(logreg_obj_multiclass, x0_iris_train, args=(data_train_centered, label_train, lambda_), approx_grad=True, maxls=200)
    
    # test the model
    data_test_centered = data_test - np.mean(data_test, axis=1).reshape((-1,1))
    w_opt = x_opt[:d*K].reshape((d, K))
    b_opt = x_opt[d*K:].reshape((K, 1))
    z_test = np.dot(w_opt.T, data_test_centered) + b_opt
    exp_z_test = np.exp(z_test)
    probs_test = exp_z_test / np.sum(exp_z_test, axis=0, keepdims=True)
    pred_test = np.argmax(probs_test, axis=0)
    
    # compute the accuracy
    accuracy = np.mean(pred_test == label_test)
    print("Test accuracy: ", accuracy)