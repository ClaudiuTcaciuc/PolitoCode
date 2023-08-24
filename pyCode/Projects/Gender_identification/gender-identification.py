import numpy as np
import matplotlib.pyplot as plt

def load_train_data():
    data_matrix = np.loadtxt("Train.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Train.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

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

if __name__ == "__main__":
    data_train, label = load_train_data()
    # data plot for training set
    # plot_histogram(data_train, label)
    # lda_solver(data_train, label)
    # correlation_matrix(data_train, label)
    pca_solver(data_train, 11)