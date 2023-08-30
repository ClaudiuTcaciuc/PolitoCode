import numpy as np
import scipy.optimize as opt

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

# define the objective function for logistic regression
def logreg_obj(v, data, label, lambda_):
    d, n = data.shape
    w, b = v[0:-1], v[-1]
    z = np.dot(w.T, data) + b
    label[label == 0] = -1
    loss = np.logaddexp(0, -label * z)
    reg = (lambda_ / 2 ) * np.sum(w**2)
    J = (1.0/n)*np.sum(loss) + reg
    return J

def logistic_regression(data_train, label_train, data_test, label_test):
    data_train_centered = data_train - np.mean(data_train, axis=0)
    d, n = data_train_centered.shape
    x0_iris_train = np.zeros(d+1, )
    lambda_ = 1e-6
    
    x_opt, f_opt, info = opt.fmin_l_bfgs_b(logreg_obj, x0_iris_train, args=(data_train_centered, label_train, lambda_), approx_grad=True)
    
    # Compute the accuracy
    data_test_centered = data_test - np.mean(data_test, axis=0)
    w_pred, b_pred = x_opt[0:-1], x_opt[-1]
    z_pred = np.dot(w_pred.T, data_test_centered) + b_pred
    label_test[label_test == 0] = -1
    score = np.sign(z_pred) * label_test
    accuracy = (score > 0).sum() / label_test.shape[0]
    print(f'Accuracy: {accuracy}')