import numpy as np
import graph as gp
import gaussian_classifier as gauss_clf
import logistic_regression as logreg_clf

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
    prior_prob = 0.1
    
    # MVG raw data
    err_rate = gauss_clf.MVG(data_train.T, label_train.T, data_test.T, label_test.T, prior_prob)
    print(f"Error rate of MVG raw data prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG PCA 12
    data_train_pca_12, _ = gp.pca_solver(data_train, 12)
    data_test_pca_12, _ = gp.pca_solver(data_test, 12)
    
    err_rate = gauss_clf.MVG(data_train_pca_12.T, label_train.T, data_test_pca_12.T, label_test.T, prior_prob)
    print(f"Error rate of MVG PCA 12 prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG PCA 11
    data_train_pca_11, _ = gp.pca_solver(data_train, 11)
    data_test_pca_11, _ = gp.pca_solver(data_test, 11)
    
    err_rate = gauss_clf.MVG(data_train_pca_11.T, label_train.T, data_test_pca_11.T, label_test.T, prior_prob)
    print(f"Error rate of MVG PCA 11 prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG PCA 10
    data_train_pca_10, _ = gp.pca_solver(data_train, 10)
    data_test_pca_10, _ = gp.pca_solver(data_test, 10)
    
    err_rate = gauss_clf.MVG(data_train_pca_10.T, label_train.T, data_test_pca_10.T, label_test.T, prior_prob)
    print(f"Error rate of MVG PCA 10 prior prob {prior_prob}: {err_rate:.3f}")
    
    # z-score normalization
    data_train_norm = gauss_clf.z_score(data_train)
    data_test_norm = gauss_clf.z_score(data_test)
    
    # MVG z-score
    err_rate = gauss_clf.MVG(data_train_norm.T, label_train.T, data_test_norm.T, label_test.T, prior_prob)
    print(f"Error rate of MVG z-score prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG z-score PCA 12
    data_train_norm_pca_12, _ = gp.pca_solver(data_train_norm, 12)
    data_test_norm_pca_12, _ = gp.pca_solver(data_test_norm, 12)
    
    err_rate = gauss_clf.MVG(data_train_norm_pca_12.T, label_train.T, data_test_norm_pca_12.T, label_test.T, prior_prob)
    print(f"Error rate of MVG z-score PCA 12 prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG z-score PCA 11
    data_train_norm_pca_11, _ = gp.pca_solver(data_train_norm, 11)
    data_test_norm_pca_11, _ = gp.pca_solver(data_test_norm, 11)
    
    err_rate = gauss_clf.MVG(data_train_norm_pca_11.T, label_train.T, data_test_norm_pca_11.T, label_test.T, prior_prob)
    print(f"Error rate of MVG z-score PCA 11 prior prob {prior_prob}: {err_rate:.3f}")
    
    # MVG z-score PCA 10
    data_train_norm_pca_10, _ = gp.pca_solver(data_train_norm, 10)
    data_test_norm_pca_10, _ = gp.pca_solver(data_test_norm, 10)
    
    err_rate = gauss_clf.MVG(data_train_norm_pca_10.T, label_train.T, data_test_norm_pca_10.T, label_test.T, prior_prob)
    print(f"Error rate of MVG z-score PCA 10 prior prob {prior_prob}: {err_rate:.3f}")
    
    # logistic regression raw data
    lambda_reg = 1e-6
    err_rate = logreg_clf.logistic_reg_clf(data_train.T, label_train.T, data_test.T, label_test.T, lambda_reg)
    print(f"Error rate of logistic regression raw data lambda {lambda_reg:}: {err_rate:.3f}")
    
    # logistic regression z-score
    err_rate = logreg_clf.logistic_reg_clf(data_train_norm.T, label_train.T, data_test_norm.T, label_test.T, lambda_reg)
    print(f"Error rate of logistic regression z-score lambda {lambda_reg:}: {err_rate:.3f}")