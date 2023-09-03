import numpy as np
import scipy.optimize as opt

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def logreg_obj(v, data, label, lambda_):
    d, n = data.shape
    w, b = v[0:-1], v[-1]
    z = np.dot(w.T, data) + b
    label[label == 0] = -1
    loss = np.logaddexp(0, -label * z)
    reg = (lambda_ / 2 ) * np.sum(w**2)
    J = (1.0/n)*np.sum(loss) + reg
    return J

def compute_accuracy(data_test, label_test, x_opt):
    data_test_centered = data_test - np.mean(data_test, axis=0)
    w_pred, b_pred = x_opt[0:-1], x_opt[-1]
    z_pred = np.dot(w_pred.T, data_test_centered) + b_pred
    score = np.sign(z_pred) * label_test
    accuracy = (score > 0).sum() * 1.0 / len(label_test)
    return accuracy

def logistic_regression (data_train, label_train, data_test, label_test ,lambda_):
    label_train[label_train == 0] = -1
    label_test[label_test == 0] = -1
    
    d, n = data_train.shape
    data_train_centered = data_train - np.mean(data_train, axis=0)
    x0_train = np.zeros(n+1, )
    
    x_opt, _, _ = opt.fmin_l_bfgs_b(logreg_obj, x0_train, args=(data_train_centered.T, label_train.T, lambda_), approx_grad=True)

    accuracy = compute_accuracy(data_test.T, label_test.T, x_opt)
    err = 1 - accuracy
    return err