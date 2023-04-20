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
    exp_term = term_1 + term_2 + term_3
    return exp_term

def mvg_log(log_score, label_test):
    log_score = log_score + np.log(1/3)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    accuracy = np.sum(acc)/label_test.shape[0]
    err_rate = 1 - accuracy
    return err_rate

def multivariate_gaussian_classifier(data_train, label_train, data_test, label_test):
    log_score = []
    for i in np.unique(label_train):
        mean = np.mean(data_train[:, label_train == i], axis=1)
        centered_data = data_train[:, label_train == i] - mean.reshape(-1, 1)
        cov = np.dot(centered_data, centered_data.T)/centered_data.shape[1]
        log_score.append(log_likelihood(data_test, mean, cov))
    return  mvg_log(np.array(log_score), label_test)

def naive_bayes_classifier(data_train, label_train, data_test, label_test):
    mean = []
    cov = []
    score_log = []
    for i in np.unique(label_train):
        mean.append(np.mean(data_train[:, label_train == i], axis=1))
        centered_data = data_train[:, label_train == i] - mean[i].reshape(-1, 1)
        cov.append(np.dot(centered_data, centered_data.T)/centered_data.shape[1])
    cov = [np.diag(np.diag(c)) for c in cov]
    for i in np.unique(label_train):
        score_log.append(log_likelihood(data_test, mean[i], cov[i]))
    return  mvg_log(np.array(score_log), label_test)

def covariance_gaussian_classifier (data_train, label_train, data_test, label_test):
    score_log = []
    cov_whithin = np.sum([np.cov(data_train[:, label_train == i]) for i in np.unique(label_train)], axis=0)/np.unique(label_train).size
    for i in np.unique(label_train):
        mean = np.mean(data_train[:, label_train == i], axis=1)
        score_log.append(log_likelihood(data_test, mean, cov_whithin))
    return mvg_log(np.array(score_log), label_test)

def k_cross_validation(data, label, k=1):
    len_element = data.shape[1]
    score_log_MVG = np.zeros((len(np.unique(label)), len_element))
    score_log_BAYES = np.zeros((len(np.unique(label)), len_element))
    score_log_GAUSSIAN = np.zeros((len(np.unique(label)), len_element))
    for i in range (0, len_element, k):
        data_test = data[:, i:i+k]
        label_test = label[i:i+k]
        data_train = np.delete(data, range(i,i+k), axis=1)
        label_train = np.delete(label, range(i,i+k), axis=0)
        # multivariate gaussian classifier
        for j in np.unique(label_train):
            mean = np.mean(data_train[:, label_train == j], axis=1)
            centered_data = data_train[:, label_train == j] - mean.reshape(-1, 1)
            cov = np.dot(centered_data, centered_data.T)/centered_data.shape[1]
            score_log_MVG[j, i:i+k] = log_likelihood(data_test, mean, cov)
        # naive bayes classifier
        for j in np.unique(label_train):
            mean = np.mean(data_train[:, label_train == j], axis=1)
            centered_data = data_train[:, label_train == j] - mean.reshape(-1, 1)
            cov = np.dot(centered_data, centered_data.T)/centered_data.shape[1]
            cov = np.diag(np.diag(cov))
            score_log_BAYES[j, i:i+k] = log_likelihood(data_test, mean, cov)
        # covariance gaussian classifier
        cov_whithin = np.sum([np.cov(data_train[:, label_train == j]) for j in np.unique(label_train)], axis=0)/np.unique(label_train).size
        for j in np.unique(label_train):
            mean = np.mean(data_train[:, label_train == j], axis=1)
            score_log_GAUSSIAN[j, i:i+k] = log_likelihood(data_test, mean, cov_whithin)
    error_mvg = mvg_log(score_log_MVG, label)
    error_bayes = mvg_log(score_log_BAYES, label)
    error_cov = mvg_log(score_log_GAUSSIAN, label)
    return error_mvg, error_bayes, error_cov

if __name__ == "__main__":
    data, label = load_iris()
    (data_train, label_train), (data_test, label_test) = split_data(data, label)
    err_rate_mvg = multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)
    print(f"error rate for mvg {err_rate_mvg*100:.2} %")
    err_rate_bayes = naive_bayes_classifier(data_train, label_train, data_test, label_test)
    print(f"error rate for bayes {err_rate_bayes*100:.2} %")
    err_rate_cov = covariance_gaussian_classifier(data_train, label_train, data_test, label_test)
    print(f"error rate for cov {err_rate_cov*100:.2} %")
    err_rate_cross_mvg, err_rate_cross_bayes, err_rate_cross_gauss = k_cross_validation(data, label)
    print(f"error rate for cross mvg {err_rate_cross_mvg*100:.2} %")
    print(f"error rate for cross bayes {err_rate_cross_bayes*100:.2} %")
    print(f"error rate for cross cov {err_rate_cross_gauss*100:.2} %")
    