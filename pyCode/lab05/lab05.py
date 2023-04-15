import numpy as np 
import matplotlib.pyplot as plt
import scipy
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
    log_score = []
    for i in np.unique(label_train):
        mean.append(np.mean(data_train[:, label_train == i], axis=1))
        centered_data = data_train[:, label_train == i] - mean[i].reshape(-1, 1)
        cov.append(np.dot(centered_data, centered_data.T)/centered_data.shape[1])
        score.append(np.exp(log_likelihood(data_test, mean[i], cov[i]))/3)
        log_score.append(log_likelihood(data_test, mean[i], cov[i]))
    mvg_numerical(score)
    mvg_log(log_score, label_test)

def mvg_log(log_score, label_test):
    log_score = log_score + np.log(1/3)
    marginal_log_score = np.log(np.sum(np.exp(log_score), axis=0))
    marginal_log_score_scipy = scipy.special.logsumexp(log_score, axis=0)
    #print("marginal log score: \n{}".format(marginal_log_score))
    posterior_log_score = log_score - marginal_log_score_scipy
    posterior_score = np.exp(posterior_log_score)
    accuracy = np.sum(np.argmax(posterior_score, axis=0) == label_test)/len(label_test)
    # print(f"accuracy: {accuracy}")
    error_rate = 1 - accuracy
    # print("error rate: {}".format(error_rate))
    #print("posterior log score: \n{}".format(posterior_log_score))
    return accuracy, error_rate
    
def mvg_numerical(score):
    marginal_score = np.sum(score, axis=0)
    #print("marginal score: {}".format(marginal_score))
    posterior_score = score/marginal_score
    #print("posterior score: {}".format(posterior_score))
    accuracy = np.sum(np.argmax(score, axis=0) == label_test)/len(label_test)
    print("accuracy: {}".format(accuracy))
    error_rate = 1 - accuracy
    print("error rate: {}".format(error_rate))
    
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

def naive_bayes_classifier(data_train, label_train, data_test, label_test):
    mean = []
    cov = []
    score = []
    score_log = []
    for i in np.unique(label_train):
        mean.append(np.mean(data_train[:, label_train == i], axis=1))
        centered_data = data_train[:, label_train == i] - mean[i].reshape(-1, 1)
        cov.append(np.dot(centered_data, centered_data.T)/centered_data.shape[1])
    cov = [np.diag(np.diag(c)) for c in cov]
    for i in np.unique(label_train):
        score.append(np.exp(log_likelihood(data_test, mean[i], cov[i]))/3)
        score_log.append(log_likelihood(data_test, mean[i], cov[i]))
    mvg_numerical(score)
    mvg_log(score_log, label_test)

def covariance_gaussian_classifier(data_train, label_train, data_test, label_test):
    mean = []
    score = []
    score_log = []
    cov_whithin = np.sum([np.cov(data_train[:, label_train == i]) for i in np.unique(label_train)], axis=0)/np.unique(label_train).size
    for i in np.unique(label_train):
        mean.append(np.mean(data_train[:, label_train == i], axis=1))
        score.append(np.exp(log_likelihood(data_test, mean[i], cov_whithin))/3)
    mvg_numerical(score)    

def k_cross_validation(data, label, k=1):
    # split the data into k folds
    len_element = data.shape[1]
    accuracy = []
    score_log = np.zeros((3,150))
    for i in range (0, len_element, k):
        mean = []
        cov = []
        score_log_list = []
        data_test = data[:, i:i+k]
        label_test = label[i:i+k]
        data_train = np.delete(data, np.s_[i:i+k], axis=1)
        label_train = np.delete(label, np.s_[i:i+k], axis=0)
        # multivariate gaussian classifier
        for j in np.unique(label_train):
            mean.append(np.mean(data_train[:, label_train == j], axis=1))
            centered_data = data_train[:, label_train == j] - mean[j].reshape(-1, 1)
            cov.append(np.dot(centered_data, centered_data.T)/centered_data.shape[1])
            score_log[j, i:i+k] = log_likelihood(data_test, mean[j], cov[j])
            score_log[j, i:i+k] = score_log[j, i:i+k] + np.log(1/3)

            
def vRow(x):
    return x.reshape(1, x.size)

def vCol(x):
    return x.reshape(x.size, 1)

if __name__ == "__main__":
    data, label = load_iris()
    (data_train, label_train), (data_test, label_test) = split_data(data, label)
    multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)
    #naive_bayes_classifier(data_train, label_train, data_test, label_test)
    #covariance_gaussian_classifier(data_train, label_train, data_test, label_test)
    #k_cross_validation(data, label)
    