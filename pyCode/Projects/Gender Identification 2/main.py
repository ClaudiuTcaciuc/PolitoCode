import numpy as np
import graph as gp

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
    
    # gp.plot_all_graphs(data_train, label_train)
    # gp.pca_variance(data_train)
    # gp.lda_histogram(data_train, label_train)