import numpy as np

def z_score(data):
    mean = np.mean(data, axis=0)
    std = np.std(data, axis=0)
    z_score_data = (data - mean) / std
    return z_score_data

def center_data(data):
    mean = np.mean(data, axis=0)
    centered_data = data - mean
    return centered_data

def normalize_data(data):
    norm = np.linalg.norm(data, axis=0)
    normalized_data = data / norm
    return normalized_data

def pca(data, m=2):
    mu = np.mean(data, axis=0)
    data_centered = data - mu
    cov = np.cov(data_centered.T)
    
    eigenvalues, eigenvectors = np.linalg.eig(cov)
    sorted_index = np.argsort(eigenvalues)[::-1]
    sorted_eigenvectors = eigenvectors[:, sorted_index]
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    
    new_data = data_centered.dot(selected_eigenvectors)
    return np.array(new_data)

def lda(data, label, m=2):
    mu_class = np.array([np.mean(data[label == i], axis=0) for i in np.unique(label)])
    mu_global = np.mean(data, axis=0)
    
    Sw = np.sum([np.cov(data[label == i].T) for i in np.unique(label)], axis=0)/len(mu_class)
    Sb = np.sum([np.outer(mu_class[i] - mu_global, mu_class[i] - mu_global) for i in range(len(mu_class))], axis=0)/len(mu_class)
    
    eigenvalues, eigenvectors = np.linalg.eig(np.linalg.inv(Sw).dot(Sb))
    sorted_eigenvectors = eigenvectors[:, np.argsort(eigenvalues)[::-1]]
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    
    new_data = data.dot(selected_eigenvectors)
    new_data = np.real(new_data)
    
    return np.array(new_data)