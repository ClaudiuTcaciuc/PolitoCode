import numpy as np
import matplotlib.pyplot as plt

def multivariate_gaussian_density(x, mu, sigma):
    len_x = len(x)
    #det_sigma = np.linalg.det(sigma)
    inv_sigma = np.linalg.inv(sigma)
    sign, det_sigma_log = np.linalg.slogdet(sigma)
    det_sigma = sign * np.exp(det_sigma_log)
    x_mu = x - mu
    # log
    term_1 = -0.5 * len_x * np.log(2 * np.pi)
    term_2 = -0.5 * np.log(det_sigma)
    term_3 = -0.5 * np.dot(np.dot(x_mu.T, inv_sigma), x_mu)
    log = term_1 + term_2 + term_3
    return log

def logpdf_GAU_ND(x, mu, sigma):
    logpdf = np.zeros((x.shape[0], 1))
    for i in range(x.shape[1]):
        logpdf[i] = multivariate_gaussian_density(x[:,i], mu, sigma)
    return logpdf.reshape (x.size,)

def maximum_likelihood_GAU_ND(x):
    mu = np.mean(x, axis=1)
    print(x.shape)
    data_centered = x - mu.reshape(x.shape[0], 1)
    sigma = np.dot(data_centered, data_centered.T) / x.shape[1]
    return mu, sigma

def loglikelihood(XND, m_ML, C_ML):
    logpdf = logpdf_GAU_ML(XND, m_ML, C_ML)
    return np.sum(logpdf)

def logpdf_GAU_ML(x, mu, sigma):
    logpdf = np.zeros((x.shape[1], 1))
    for i in range(x.shape[1]):
        logpdf[i] = multivariate_gaussian_density(x[:, i], mu, sigma)
    return logpdf

def vRow(x):
    return x.reshape(1, x.size)

def vCol(x):
    return x.reshape(x.size, 1)

if __name__ == "__main__":
    plt.figure()
    Xplot = np.linspace(-8, 12, 1000)
    m = np.ones((1,1)) * 1.0
    C = np.ones((1,1)) * 2.0
    pdf = logpdf_GAU_ND(vCol(Xplot), m, C)
    pdfSol = np.load("Solution/llGAU.npy")
    print("diff from sol: ",np.abs(pdf - pdfSol).max())
    #plt.plot(Xplot.ravel(), np.exp(pdf))
    #plt.show()
    mlSol = np.load("Solution/XND.npy")
    mu_ml, sigma_ml = maximum_likelihood_GAU_ND(mlSol)
    print("Mu\n", mu_ml)
    print("Sigma\n", sigma_ml)
    ll = loglikelihood(mlSol, mu_ml, sigma_ml)
    print("Log-likelihood: ", ll)
    
    mlSol1D = np.load("Solution/X1D.npy")
    mu_ml1D, sigma_ml1D = maximum_likelihood_GAU_ND(vRow(mlSol1D))
    print("Mu\n", mu_ml1D)
    print("Sigma\n", sigma_ml1D)
    ll1D = loglikelihood(vRow(mlSol1D), mu_ml1D, sigma_ml1D)
    print("Log-likelihood 1D: ", ll1D)
    plt.hist(mlSol1D.ravel(), bins=50, density=True)
    plt.plot(Xplot.ravel(), np.exp(logpdf_GAU_ML(vRow(Xplot), mu_ml1D, sigma_ml1D)))
    plt.show()
    