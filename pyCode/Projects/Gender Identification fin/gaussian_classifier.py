import numpy as np
import scipy.special

def calculate_mean_cov(features, labels):
    unique_labels = np.unique(labels)
    mean_vectors = {}
    cov_matrices = {}
    
    for label in unique_labels:
        class_data = features[labels == label]
        mean_vectors[label] = np.mean(class_data, axis=0)
        centered_class_data = class_data - mean_vectors[label]
        cov_matrices[label] = np.dot(centered_class_data.T, centered_class_data) / len(centered_class_data)
    
    return mean_vectors, cov_matrices

def multivariate_gaussian_pdf(x, mean, cov_matrix):
    n = len(mean)
    sign, sigma_det = np.linalg.slogdet(cov_matrix)
    sigma_inv = np.linalg.inv(cov_matrix)
    centered_data = x - mean
    
    term_1 = -0.5 * n * np.log(2 * np.pi)
    term_2 = -0.5 * sign * sigma_det
    term_3 = -0.5 * np.dot(np.dot(centered_data.T, sigma_inv), centered_data)
    
    return term_1 + term_2 + term_3

def calculate_accuracy(log_scores, label_test, prior=0.5):
    log_scores = log_scores + np.log(prior)
    marginal_log_score = scipy.special.logsumexp(log_scores, axis=1).reshape(-1, 1)
    posterior_log_score = log_scores - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    predicted_labels = np.argmax(posterior_score, axis=1)
    
    accuracy = np.sum(predicted_labels == label_test) / len(label_test)
    return accuracy

def MVG(data_train, label_train, data_test, label_test, prior=0.5):
    mean_vectors, cov_matrices = calculate_mean_cov(data_train, label_train)
    unique_labels = np.unique(label_train)
    log_scores = []

    for x in data_test:
        class_scores = []
        for label in unique_labels:
            log_likelihood = multivariate_gaussian_pdf(x, mean_vectors[label], cov_matrices[label])
            class_scores.append(log_likelihood)
        
        log_scores.append(class_scores)
    
    accuracy = calculate_accuracy(np.array(log_scores), label_test, prior)
    err = 1 - accuracy
    return err
