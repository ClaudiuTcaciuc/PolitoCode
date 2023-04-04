import numpy as np
import matplotlib.pyplot as plt
# Load the data npy file
sol_data = np.load("IRIS_PCA_matrix_m4.npy")

# Load the data csv file
def readData(filename):
    data_matrix = np.loadtxt(filename, delimiter=",", usecols=(0,1,2,3)).reshape(150,4)
    data_label = np.loadtxt(filename, delimiter=",", usecols=(4), dtype=str).reshape(150,1)
    return data_matrix, data_label

def pca_solver(data, label, m):
    mu = np.mean(data, axis=0)
    data_centered = data - mu
    # Compute the covariance matrix
    cov = np.cov(data_centered.T)
    # Compute the eigenvalues and eigenvectors of the covariance matrix
    eigenvalues, eigenvectors = np.linalg.eig(cov)
    # Sort the eigenvalues and eigenvectors in descending order
    sorted_index = np.argsort(eigenvalues)[::-1]
    sorted_eigenvectors = eigenvectors[:, sorted_index]
    # Select the first m eigenvectors
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    new_data = data_centered.dot(selected_eigenvectors)
    plotData(new_data, label)

def lda_solver (data, label, m):
    # Compute the mean of each class
    mu_class = np.array([np.mean(data[label[:,0] == i], axis=0) for i in np.unique(label)])
    # Compute the mean of the whole data
    mu_global = np.mean(data, axis=0)
    # Compute the within-class covariance matrix
    Sw = np.sum([np.cov(data[label[:,0] == i].T) for i in np.unique(label)], axis=0)/len(mu_class)
    # Compute the between-class covariance matrix
    Sb = np.sum([np.outer(mu_class[i] - mu_global, mu_class[i] - mu_global) for i in range(len(mu_class))], axis=0)/len(mu_class)
    # Compute the eigenvalues and eigenvectors of the covariance matrix
    eigenvalues, eigenvectors = np.linalg.eig(np.linalg.inv(Sw).dot(Sb))
    # Sort the eigenvectors in descending order
    sorted_eigenvectors = eigenvectors[:, np.argsort(eigenvalues)[::-1]]
    # Select the first m eigenvectors
    selected_eigenvectors = sorted_eigenvectors[:, :m]
    # Compute the new data
    new_data = data.dot(selected_eigenvectors)
    # Plot the new data
    plotData(new_data, label)
    
    
def plotData (transformed_data, label):
    data_iris_setosa = transformed_data[label[:,0] == "Iris-setosa"]
    data_iris_veriscolor = transformed_data[label[:,0] == "Iris-versicolor"]
    data_iris_virginica = transformed_data[label[:,0] == "Iris-virginica"]
    plt.scatter(data_iris_setosa[:,0], data_iris_setosa[:,1])
    plt.scatter(data_iris_veriscolor[:,0], data_iris_veriscolor[:,1])
    plt.scatter(data_iris_virginica[:,0], data_iris_virginica[:,1])
    plt.show()

if __name__ == "__main__":
    data, label = readData("iris.csv")
    pca_solver(data,label, 2)
    lda_solver(data, label, 2)
