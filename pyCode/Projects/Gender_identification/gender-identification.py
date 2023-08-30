import numpy as np
import matplotlib.pyplot as plt
import scipy

# Load the data from the file
def load_train_data():
    data_matrix = np.loadtxt("Train.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Train.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

def load_test_data():
    data_matrix = np.loadtxt("Test.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Test.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

# Plot the scatter plot for each pair of features
def plot_scatter(data_train, label):
    # Separate the data into two groups based on the label
    data_male = data_train[label == 0]
    data_female = data_train[label == 1]
    
    # Create scatter plots for each pair of features
    num_features = data_train.shape[1]
    plt.figure(figsize=(16, 10))
    
    for i in range(num_features - 1):
        for j in range(i + 1, num_features):
            plt.subplot(num_features - 1, num_features - 1, i * (num_features - 1) + j)
            plt.scatter(data_male[:, i], data_male[:, j], c='blue', label='Male', alpha=0.5, s=10)  # Adjust s (marker size)
            plt.scatter(data_female[:, i], data_female[:, j], c='red', label='Female', alpha=0.5, s=10)  # Adjust s (marker size)
    plt.tight_layout()
    plt.show()

# Plot the histogram for each feature
def plot_histogram(data_train, label):
    # Separate the data into two groups based on the label
    data_male = data_train[label == 0]
    data_female = data_train[label == 1]
    
    # Create histograms for each feature
    num_features = data_train.shape[1]
    plt.figure(figsize=(12, 8))

    for i in range(num_features):
        plt.subplot(num_features//5+1, num_features//4+1, i + 1)
        plt.hist(data_male[:, i], bins=50, alpha=0.5, label='Male', color='blue', density=True, edgecolor='black')
        plt.hist(data_female[:, i], bins=50, alpha=0.5, label='Female', color='red', density=True, edgecolor='black')
        plt.title(f'Feature {i+1}')
        plt.legend()
    plt.tight_layout()
    plt.show()

# Compute the pca solution and plot the explained variance ratio
def pca_solver(data, m):
    mu = np.mean(data, axis=0)
    data_centered = data - mu
    cov = np.cov(data_centered.T)
    
    eigenvalues, eigenvectors = np.linalg.eig(cov)
    sorted_index = np.argsort(eigenvalues)[::-1]
    sorted_eigenvectors = eigenvectors[:, sorted_index]
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    
    new_data = data_centered.dot(selected_eigenvectors)
    
    # plot thge PCA - explained variance
    total_eigenvalues = np.sum(eigenvalues)
    var_exp = [(i / total_eigenvalues) for i in sorted(eigenvalues, reverse=True)]
    cum_sum_exp = np.cumsum(var_exp)
    # not necessary but useful to see the explained variance
    plt.bar(range(0, len(var_exp)), var_exp, alpha=0.5, align='center', label='individual explained variance')
    plt.step(range(0, len(cum_sum_exp)), cum_sum_exp, where='mid', label='cumulative explained variance')
    plt.ylabel('Explained variance ratio')
    plt.xlabel('Principal components')
    plt.legend(loc='best')
    plt.tight_layout()
    plt.show()

# Compute the lda solution and plot the histogram for the new data
def lda_solver (data, label, m = 1): # we are in a binary case so m = n_classes -1 -> m = 1
    mu_class = np.array([np.mean(data[label == i], axis=0) for i in np.unique(label)])
    mu_global = np.mean(data, axis=0)
    
    Sw = np.sum([np.cov(data[label == i].T) for i in np.unique(label)], axis=0)/len(mu_class)
    Sb = np.sum([np.outer(mu_class[i] - mu_global, mu_class[i] - mu_global) for i in range(len(mu_class))], axis=0)/len(mu_class)
    
    eigenvalues, eigenvectors = np.linalg.eig(np.linalg.inv(Sw).dot(Sb))
    sorted_eigenvectors = eigenvectors[:, np.argsort(eigenvalues)[::-1]]
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    
    new_data = data.dot(selected_eigenvectors)
    new_data = np.real(new_data)
    
    # plot the LDA solution
    plot_histogram(new_data, label)

# Compute the correlation matrix for the data and for each class
def correlation_matrix (data, label):
    pearson_corr = np.corrcoef(data, rowvar=False)
    class_corr = {}
    
    for class_label in np.unique(label):
        class_data = data[label == class_label]
        class_corr[class_label] = np.corrcoef(class_data, rowvar=False)
        
    plot_corr(pearson_corr, 'Greys', 'Dataset')
    plot_corr(class_corr[0], 'Blues', f'Class {0}')
    plot_corr(class_corr[1], 'Reds', f'Class {1}')

def plot_corr(data, color , title):
    plt.figure(figsize=(10, 8))
    plt.imshow(data, cmap=color, interpolation='nearest', vmin=-0.3, vmax=1)
    plt.title(title)
    plt.colorbar()
    plt.show()

def log_likelihood(x, mean, sigma):
    size = len(x)
    sign, sigma_det = np.linalg.slogdet(sigma)
    sigma_inv = np.linalg.inv(sigma)
    centered_data = x - mean.reshape(-1, 1)
    
    term_1 = -size/2 * np.log(2*np.pi)
    term_2 = -1/2 * sign * sigma_det
    term_3 = -1/2 * np.sum(centered_data.T.dot(sigma_inv) * centered_data.T, axis=1)
    exp_term = term_1 + term_2 + term_3
    return exp_term

def compute_accuracy(log_score, label_test):
    log_score = log_score + np.log(0.1)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    accuracy = np.sum(acc)/label_test.shape[0]
    return accuracy

def multivariate_gaussian_classifier(data_train, label_train, data_test, label_test):
    log_score = []
    for i in np.unique(label_train):
        mean = np.mean(data_train[:, label_train == i], axis=1)
        centered_data = data_train[:, label_train == i] - mean.reshape(-1, 1)
        cov = np.dot(centered_data, centered_data.T)/centered_data.shape[1]
        log_score.append(log_likelihood(data_test, mean, cov))
    return  compute_accuracy(np.array(log_score), label_test)

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
    return  compute_accuracy(np.array(score_log), label_test)

def covariance_gaussian_classifier (data_train, label_train, data_test, label_test):
    score_log = []
    cov_whithin = np.sum([np.cov(data_train[:, label_train == i]) for i in np.unique(label_train)], axis=0)/np.unique(label_train).size
    for i in np.unique(label_train):
        mean = np.mean(data_train[:, label_train == i], axis=1)
        score_log.append(log_likelihood(data_test, mean, cov_whithin))
    return compute_accuracy(np.array(score_log), label_test)

def MVG_classifier(data_train, label_train, data_test, label_test):
    print("Multivariate Gaussian Classifier")
    acc = multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)
    print(f"Error rate: {1-acc}")
    print("Naive Bayes Classifier")
    acc = naive_bayes_classifier(data_train, label_train, data_test, label_test)
    print(f"Error rate: {1-acc}")
    print("Covariance Gaussian Classifier")
    acc = covariance_gaussian_classifier(data_train, label_train, data_test, label_test)
    print(f"Error rate: {1-acc}")

if __name__ == "__main__":
    data_train, label_train = load_train_data()
    data_test, label_test = load_test_data()
    # data plot for training set
    # plot_histogram(data_train, label_train)
    # lda_solver(data_train, label_train)
    # correlation_matrix(data_train, label_train)
    # pca_solver(data_train, 11)
    MVG_classifier(data_train.T, label_train.T, data_test.T, label_test.T)