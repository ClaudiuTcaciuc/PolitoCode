import numpy as np
import graph
import gaussian
import logistic_regression

# Load the data from the file
def load_train_data():
    data_matrix = np.loadtxt("Train.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Train.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

def load_test_data():
    data_matrix = np.loadtxt("Test.txt", delimiter=",", usecols=range(0, 12))
    data_label = np.loadtxt("Test.txt", delimiter=",", usecols=12, dtype=int)
    return data_matrix, data_label

if __name__ == "__main__":
    data_train, label_train = load_train_data()
    data_test, label_test = load_test_data()
    
    # Plot the graph
    graph.plot_histogram(data_train, label_train)
    # graph.plot_scatter(data_train, label_train) -> need to fix the graph display
    
    lda_data = graph.lda_solver(data_train, label_train)
    graph.plot_histogram(lda_data, label_train)
    
    pca_data_train_11, eigenvalues = graph.pca_solver(data_train, 11)
    graph.plot_pca_explained_variance(eigenvalues)
    
    graph.correlation_matrix(data_train, label_train)
    
    print("----\t Gaussian Classifier \t----")
    gaussian.multivariate_gaussian_classifier(data_train, label_train, data_test, label_test)
    print("----\t Naive Bayes Classifier \t----")
    gaussian.naive_bayes_classifier(data_train, label_train, data_test, label_test)
    print("----\t Covariance Gaussian Classifier \t----")
    gaussian.covariance_gaussian_classifier(data_train, label_train, data_test, label_test)
    print("----\t Logistic Regression \t----")
    logistic_regression.logistic_regression(data_train.T, label_train.T, data_test.T, label_test.T)