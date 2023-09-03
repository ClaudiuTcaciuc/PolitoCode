import numpy as np
import scipy
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score

def vRow(x):
    return x.reshape(1, x.size)

def vCol(x):
    return x.reshape(x.size, 1)

def calculate_accuracy(log_score, label_test, prior = 0.5):
    log_score = log_score + np.log(prior)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    accuracy = np.sum(acc)/label_test.shape[0]
    err_rate = 1 - accuracy
    return err_rate

def z_score (data):
    mean = np.mean(data, axis=0)
    std = np.std(data, axis=0)
    new_data = (data - mean)/std
    return new_data
#########################################################################

def log_likelihood(x, mean, cov):
    # compute the log likelihood of x given the mult ivariate Gaussian distribution with mean and cov
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
    exp_term = term_1 + term_2 + term_3
    return exp_term

def multivariate_gaussian_classifier(data_train, label_train, data_test, label_test):
    log_score = []
    for i in np.unique(label_train):
        mean = np.mean(data_train[:, label_train == i], axis=1)
        centered_data = data_train[:, label_train == i] - mean.reshape(-1, 1)
        cov = np.dot(centered_data, centered_data.T)/centered_data.shape[1]
        log_score.append(log_likelihood(data_test, mean, cov))
    return  log_score

def MVG(data_train, label_train, data_test, label_test, prior_prob):
    # to do the classification using MVG
    log_score = multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)
    err_rate = calculate_accuracy(log_score, label_test, prior_prob)
    return err_rate