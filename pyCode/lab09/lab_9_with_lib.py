import numpy as np
import scipy.optimize as opt
from sklearn import datasets
from sklearn.svm import SVC

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

def primal_svm_dual_formulation(data_train, label_train, C=1.0, K=1):
    # Extend the data with a constant feature
    extensor = np.ones((1, data_train.shape[1])) * K
    extended_data_train = np.concatenate((data_train, extensor), axis=0)

    # Create an instance of SVC with linear kernel
    clf = SVC(C=C, kernel='linear')

    # Fit the model on the training data
    clf.fit(extended_data_train.T, label_train)

    # Get the weights and bias
    w_vec = clf.coef_[0]
    b_opt = clf.intercept_
    print('w_vec = ', w_vec)
    print('b_opt = ', b_opt)
    return w_vec[:-1], b_opt
    
if __name__ == '__main__':
    # load data and split into train and test sets
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    label_train[label_train == 0] = -1  # change label 0 to -1 because we use -1 and 1 as labels
    label_test[label_test == 0] = -1
    C = 1.0
    K = 10
    w_opt, b_opt = primal_svm_dual_formulation(data_train, label_train, C, K)
    pred = np.dot(w_opt.T, data_test) + b_opt
    score = np.sign(pred.flatten()) * label_test
    accuracy = (score > 0).sum() / label_test.shape[0]
    err_rate = 1 - accuracy
    print('Error Rate: %.2f%%' % (err_rate * 100))
