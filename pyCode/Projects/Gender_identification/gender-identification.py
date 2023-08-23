import numpy as np
import matplotlib.pyplot as plt

def load_train_data():
    data_matrix = np.loadtxt("Train.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Train.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

def data_plot(data_train, label):
    # Separate the data into two groups based on the label
    data_male = data_train[label == 0]
    data_female = data_train[label == 1]

    # Create histograms for each feature
    num_features = data_train.shape[1]
    plt.figure(figsize=(12, 8))

    for i in range(num_features):
        plt.subplot(3, 4, i + 1)  # Adjust the layout as needed
        plt.hist(data_male[:, i], bins=20, alpha=0.5, label='Male', color='blue', density=True, edgecolor='black')
        plt.hist(data_female[:, i], bins=20, alpha=0.5, label='Female', color='red', density=True, edgecolor='black')
        plt.title(f'Feature {i+1}')
        plt.legend()

    plt.tight_layout()
    plt.show()
    
    # Create scatter plots for each pair of features
    plt.figure(figsize=(16, 10))
    
    for i in range(num_features - 1):
        for j in range(i + 1, num_features):
            plt.subplot(num_features - 1, num_features - 1, i * (num_features - 1) + j)
            plt.scatter(data_male[:, i], data_male[:, j], c='blue', label='Male', alpha=0.5, s=10)  # Adjust s (marker size)
            plt.scatter(data_female[:, i], data_female[:, j], c='red', label='Female', alpha=0.5, s=10)  # Adjust s (marker size)
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

    # plot the LDA solution
    data_plot(new_data, label)
    

if __name__ == "__main__":
    data_train, label = load_train_data()
    # data plot for training set
    #data_plot(data_train, label)
    # LDA solver
    lda_solver(data_train, label)
    