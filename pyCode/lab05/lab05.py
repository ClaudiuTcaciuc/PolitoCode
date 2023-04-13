import numpy as np 
import matplotlib.pyplot as plt
from sklearn import datasets

#load the data with sklearn
def load_iris():
    data, label = datasets.load_iris()['data'].T, datasets.load_iris()['target']
    return data, label

def split_data(data, label, seed=0):
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

def multivariate_gaussian_classifier(data_train, label_train, data_test, label_test):
    # compute the mean and the covariance matrix for each class
    mean = []
    cov = []
    score = []
    for i in np.unique(label_train):
        mean.append(np.mean(data_train[:, label_train == i], axis=1))
        centered_data = data_train[:, label_train == i] - mean[i].reshape(-1, 1)
        cov.append(np.dot(centered_data, centered_data.T)/centered_data.shape[1])
        score.append(np.exp(log_likelihood(data_test, mean[i], cov[i]))/3)
    for i in np.unique(label_train):
        print("mean of class {}: \n{}".format(i, mean[i]))
        print("cov of class {}: \n{}".format(i, cov[i]))
    score_sol = np.load("Solution/SJoint_MVG.npy")
    print("diff from sol: {}".format(np.sum(np.abs(score_sol - score))))
    
def log_likelihood(x, mean, cov):
    # compute the log likelihood of x given the multivariate Gaussian distribution with mean and cov
    return log_pdf_multivariate_gaussian(x, mean, cov)

def log_pdf_multivariate_gaussian(x, mean, sigma):
    # compute the log pdf of the multivariate Gaussian distribution with mean and sigma
    size = len(x)
    sign, sigma_det = np.linalg.slogdet(sigma)
    sigma_inv = np.linalg.inv(sigma)
    centered_data = x - mean.reshape(-1, 1)
    
    term_1 = -size/2 * np.log(2*np.pi)
    term_2 = -1/2 * sign * sigma_det
    term_3 = -1/2 * np.sum(centered_data.T.dot(sigma_inv) * centered_data.T, axis=1)
    exp_term = term_1+term_2+term_3
    return exp_term

if __name__ == "__main__":
    data, label = load_iris()
    (data_train, label_train), (data_test, label_test) = split_data(data, label)
    multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)