import numpy as np
import scipy

def multivariate_gaussian_classifier(data_train, label_train, data_test, label_test):
    log_score = []

    for i in np.unique(label_train):
        # Center the data for this class
        class_data = data_train[label_train == i]
        mean = np.mean(class_data, axis=0)
        centered_data = class_data - mean
        cov = np.cov(centered_data.T)
        log_score.append(log_likelihood(data_test, mean, cov))
    
    accuracy = compute_accuracy(np.array(log_score), label_test)
    print(f'Accuracy: {accuracy}')

def naive_bayes_classifier(data_train, label_train, data_test, label_test):
    mean = []
    cov = []
    log_score = []
    
    for i in np.unique(label_train):
        class_data = data_train[label_train == i]
        mean.append(np.mean(class_data, axis=0))
        cov.append(np.cov(class_data.T))
    cov = [np.diag(np.diag(c)) for c in cov]
    
    for i in np.unique(label_train):
        log_score.append(log_likelihood(data_test, mean[i], cov[i]))
    accuracy = compute_accuracy(np.array(log_score), label_test)
    print(f'Accuracy: {accuracy}')
    
def covariance_gaussian_classifier(data_train, label_train, data_test, label_test):
    log_score = []
    cov_within = np.sum([np.cov(data_train[label_train == i].T) for i in np.unique(label_train)], axis=0)
    
    for i in np.unique(label_train):
        mean = np.mean(data_train[label_train == i], axis=0)
        log_score.append(log_likelihood(data_test, mean, cov_within))
    accuracy = compute_accuracy(np.array(log_score), label_test)
    print(f'Accuracy: {accuracy}')

def log_likelihood(x, mean, sigma):
    size = len(x)
    sign, sigma_det = np.linalg.slogdet(sigma)
    sigma_inv = np.linalg.inv(sigma)
    centered_data = x - mean
    
    term_1 = -size/2 * np.log(2*np.pi)
    term_2 = -1/2 * sign * sigma_det
    term_3 = -1/2 * np.sum(np.dot(centered_data, sigma_inv) * centered_data, axis=1)
    exp_term = term_1 + term_2 + term_3
    return exp_term

def compute_accuracy(log_score, label_test):
    log_score = log_score + np.log(0.5)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    accuracy = np.sum(acc)/label_test.shape[0]
    return accuracy