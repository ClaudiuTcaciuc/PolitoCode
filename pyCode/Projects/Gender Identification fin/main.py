import numpy as np
import graph as gp
import gaussian_classifier as gc_clf
import pre_processing as pp
import logistic_reg_classifier as lrc_clf

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
    
    prior_prob = 0.5
    
    err_rate = gc_clf.MVG(data_train, label_train, data_test, label_test, prior_prob)
    print(f"Error MVG raw data prior prob {prior_prob}: {err_rate:.3f}")

    # Z-score
    z_score_data_train = pp.z_score(data_train)
    z_score_data_test = pp.z_score(data_test)
    err_rate = gc_clf.MVG(z_score_data_train, label_train, z_score_data_test, label_test, prior_prob)
    print(f"Error MVG z-score data prior prob {prior_prob}: {err_rate:.3f}")
    
    # LDA
    lda_data_train = pp.lda(data_train, label_train)
    lda_data_test = pp.lda(data_test, label_test)
    err_rate = gc_clf.MVG(lda_data_train, label_train, lda_data_test, label_test, prior_prob)
    print(f"Error MVG lda data prior prob {prior_prob}: {err_rate:.3f}")
    
    # PCA 12 components
    pca_data_train = pp.pca(data_train, 12)
    pca_data_test = pp.pca(data_test, 12)
    err_rate = gc_clf.MVG(pca_data_train, label_train, pca_data_test, label_test, prior_prob)
    print(f"Error MVG pca data prior prob {prior_prob}: {err_rate:.3f}")
    
    # PCA 11 components
    pca_data_train = pp.pca(data_train, 11)
    pca_data_test = pp.pca(data_test, 11)
    err_rate = gc_clf.MVG(pca_data_train, label_train, pca_data_test, label_test, prior_prob)
    print(f"Error MVG pca data prior prob {prior_prob}: {err_rate:.3f}")
    
    # Logistic regression
    lambda_ = 1e-6
    err_rate = lrc_clf.logistic_regression(data_train, label_train, data_test, label_test, lambda_)
    print(f"Error logistic regression raw data lambda {lambda_}: {err_rate:.3f}")