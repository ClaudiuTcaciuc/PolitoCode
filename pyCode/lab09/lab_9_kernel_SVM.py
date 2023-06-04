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

def poly_kernel (x, y, d=2, c=0):
    return (np.dot(x.T, y) + c)**d

def rbf_kernel (x, y, gamma=1):
    return np.exp(-gamma * np.linalg.norm(x - y)**2)

def build_kernel (data, K, kernel_func=poly_kernel):
    n_features, n_sample = data.shape
    Kernel_matrix = np.zeros((n_sample, n_sample))

    for i in range(n_sample):
        for j in range (n_sample):
            Kernel_matrix[i, j] = kernel_func(data[:, i], data[:, j])
    return Kernel_matrix + np.sqrt(K)

def kernel_SVM (data_train, label_train, C=1.0, K = 1.0, kernel_func=poly_kernel):
    n_features, n_sample = data_train.shape
    Kernel_matrix = build_kernel(data_train, K, kernel_func=kernel_func)

    Hessian = Kernel_matrix * np.outer(label_train, label_train)
    f = np.ones( n_sample )

    def objective_function (alpha):
        return 0.5 *np.dot( alpha.T , np.dot( Hessian, alpha )) - np.dot( alpha.T, f )

    def objective_gradient (alpha):
        return (np.dot( Hessian, alpha ) - f).reshape(n_sample, )

    bounds = [(0, C) for _ in range(n_sample)]
    result = opt.fmin_l_bfgs_b(objective_function, np.zeros(n_sample), fprime=objective_gradient, bounds=bounds, factr=1.0)
    alpha_optimal = result[0]
    dual_loss = -objective_function(alpha_optimal)
    print('dual loss: ', dual_loss)
    w_vec = np.dot (alpha_optimal * label_train, data_train.T)
    return w_vec, alpha_optimal

if __name__ == '__main__':
    # load data and split into train and test sets
    data, label = load_iris_binary()
    (data_train, label_train), (data_test, label_test) = split_data_2to1(data, label)
    label_train[label_train == 0] = -1 # change label 0 to -1 becuase we use -1 and 1 as labels
    label_test[label_test == 0] = -1
    C = 1.0
    K = 0.0
    kernel_func = poly_kernel
    w_vec, alpha_optimal = kernel_SVM(data_train, label_train, C=C, K=K, kernel_func=poly_kernel)
    print('w_vec: ', w_vec)
    support_vectors = data_train[:, alpha_optimal > 0]
    support_labels = label_train[alpha_optimal > 0]
    support_alpha = alpha_optimal[alpha_optimal > 0]

    scores = []
    for x in data_test.T:
        score = np.sum(support_alpha * support_labels * (kernel_func(support_vectors, x)+K))
        scores.append(score)
    
    prediction = np.sign(scores)
    accucary = np.sum(prediction == label_test) / len(label_test)
    error_rate = 1 - accucary
    print('Error Rate: %.2f%%' % ( error_rate * 100))