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
    
def plot_correlation_matrix(data_train, label):
    # Calculate the Pearson correlation coefficients for the dataset features
    correlation_matrix = np.corrcoef(data_train, rowvar=False)

    plt.figure(figsize=(10, 8))
    plt.imshow(correlation_matrix, cmap='gray_r', interpolation='nearest', vmin=-1, vmax=1)
    plt.title("Correlation Matrix of Dataset Features")
    plt.colorbar()
    plt.xticks(np.arange(data_train.shape[1]), np.arange(1, data_train.shape[1] + 1))
    plt.yticks(np.arange(data_train.shape[1]), np.arange(1, data_train.shape[1] + 1))
    plt.show()
    
def calculate_class_correlations(data, label):
    unique_labels = np.unique(label)
    class_correlations = {}

    for class_label in unique_labels:
        class_data = data[label == class_label]
        correlation_matrix = np.corrcoef(class_data, rowvar=False)
        class_correlations[class_label] = correlation_matrix

    return class_correlations

def plot_class_correlation_heatmaps(class_correlations):
    for class_label, correlation_matrix in class_correlations.items():
        plt.figure(figsize=(10, 8))
        plt.imshow(correlation_matrix, cmap='coolwarm', interpolation='nearest', vmin=-1, vmax=1)
        plt.title(f"Correlation Heatmap for Class {class_label}")
        plt.colorbar()
        plt.show()

if __name__ == "__main__":
    data_train, label = load_train_data()
    # data plot for training set
    plot_histogram(data_train, label)
    lda_solver(data_train, label)
    plot_correlation_matrix(data_train, label)
    
    #fix the heatmap
    class_correlations = calculate_class_correlations(data_train, label)
    plot_class_correlation_heatmaps(class_correlations)