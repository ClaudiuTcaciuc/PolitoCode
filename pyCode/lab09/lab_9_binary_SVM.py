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

def primal_svm_dual_formulation (data_train, label_train, C=1.0, K = 1):
    n_features, n_sample = data_train.shape
    extensor = np.ones(( 1, n_sample ))* K
    extended_data_train = np.concatenate(( data_train, extensor ), axis=0)
    Hessian = np.dot(extended_data_train.T, extended_data_train) * np.outer(label_train, label_train)
    f = np.ones( n_sample )
    
    def objective_function (alpha):
        return 0.5 *np.dot( alpha.T , np.dot( Hessian, alpha )) - np.dot( alpha.T, f )
    
    def gradient (alpha):
        return (np.dot( Hessian, alpha ) - f).reshape(n_sample, )
    
    bounds = [(0, C) for _ in range(n_sample)]
    result = opt.fmin_l_bfgs_b(objective_function, np.zeros(n_sample), bounds=bounds, fprime=gradient, factr=1.0)
    alpha_optimal = result[0]
    w_vec = np.dot (alpha_optimal * label_train, extended_data_train.T)
    
    dual_loss = -objective_function(alpha_optimal)
    primal_loss = 0.5 * (np.dot(w_vec.T, w_vec) ) + C * np.sum(np.maximum(0, 1 - label_train * np.dot(w_vec.T, extended_data_train) ))
    duality_gap = primal_loss - dual_loss
    print('primal loss = ', primal_loss)
    print('dual loss = ', dual_loss)
    print('duality gap = ', duality_gap)
    return w_vec

if __name__ == '__main__':
    # load data and split into train and test sets
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    label_train[label_train == 0] = -1 # change label 0 to -1 becuase we use -1 and 1 as labels
    label_test[label_test == 0] = -1
    C = 0.1
    K = 10
    w_vec = primal_svm_dual_formulation (data_train, label_train, C, K)
    print('w_opt = ', w_vec[:-1])
    print('b_opt = ', w_vec[-1])
    extensor_test = np.ones((1, data_test.shape[1])) * K
    extended_data_test = np.concatenate((data_test, extensor_test), axis=0)
    pred = np.dot(w_vec.T, extended_data_test)
    score = np.sign(pred) * label_test
    accuracy = (score > 0).sum() / label_test.shape[0]
    err_rate = 1 - accuracy
    print('Error Rate: %.2f%%' % ( err_rate * 100))