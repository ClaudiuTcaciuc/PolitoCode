import sys
import numpy as np
import scipy

def load_data():
    lInf = []
    f=open('data/inferno.txt', encoding="ISO-8859-1")
    for line in f:
        lInf.append(line.strip())
    f.close()
    lPur = []
    f=open('data/purgatorio.txt', encoding="ISO-8859-1")
    for line in f:
        lPur.append(line.strip())
    f.close()
    lPar = []
    f=open('data/paradiso.txt', encoding="ISO-8859-1")
    for line in f:
        lPar.append(line.strip())
    f.close()
    
    return lInf, lPur, lPar

def split_data(l, n):

    lTrain, lTest = [], []
    for i in range(len(l)):
        if i % n == 0:
            lTest.append(l[i])
        else:
            lTrain.append(l[i])
            
    return lTrain, lTest

def build_vocabulary(cantica):
    vocabulary = {}
    for line in cantica:
        for word in line.split():
            if word not in vocabulary:
                vocabulary[word] = 1
            else:
                vocabulary[word] += 1
    return vocabulary

def build_unite_vocabulary(inferno, purgatorio, paradiso):
    vocabulary = {}
    alpha = 0.001
    inferno_vocabulary = build_vocabulary(inferno)
    purgatorio_vocabulary = build_vocabulary(purgatorio)
    paradiso_vocabulary = build_vocabulary(paradiso)
    
    for word in set(inferno_vocabulary | purgatorio_vocabulary | paradiso_vocabulary):
        freq_inf = inferno_vocabulary.get(word, 0) / len(inferno_vocabulary) + alpha
        freq_pur = purgatorio_vocabulary.get(word, 0) / len(purgatorio_vocabulary) + alpha
        freq_par = paradiso_vocabulary.get(word, 0) / len(paradiso_vocabulary) + alpha
        vocabulary[word] = (freq_inf, freq_pur, freq_par)
    return vocabulary

def log_likelihood_cantica (voc_train, data_test):
    log_likelihood = []
    for line in data_test:
        log_likelihood_tercet = [0, 0, 0]
        for word in line.split():
            if word in voc_train:
                log_likelihood_tercet += np.log(voc_train[word])
        log_likelihood.append(log_likelihood_tercet)
    return log_likelihood

def build_score_matrix (log_likelihood_inf, log_likelihood_pur, log_likelihood_par):
    
    score_inf = np.array(log_likelihood_inf).transpose()
    score_pur = np.array(log_likelihood_pur).transpose()
    score_par = np.array(log_likelihood_par).transpose()
    label_inf = np.zeros(score_inf.shape[1])
    label_pur = np.ones(score_pur.shape[1])
    label_par = np.ones(score_par.shape[1]) * 2
    err_inf = mvg_log(score_inf, label_inf)
    err_pur = mvg_log(score_pur, label_pur)
    err_par = mvg_log(score_par, label_par)
    print("Accuracy for Inferno: ", 1-err_inf)
    print("Accuracy for Purgatorio: ", 1-err_pur)
    print("Accuracy for Paradiso: ", 1-err_par)

def mvg_log(log_score, label_test):
    log_score = log_score + np.log(1/3)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    accuracy = np.sum(acc)/label_test.shape[0]
    err_rate = 1 - accuracy

    return err_rate
    
if __name__ == '__main__':

    # Load the tercets and split the lists in training and test lists
    
    lInf, lPur, lPar = load_data()

    lInf_train, lInf_evaluation = split_data(lInf, 4)
    lPur_train, lPur_evaluation = split_data(lPur, 4)
    lPar_train, lPar_evaluation = split_data(lPar, 4)
    
    # Create the vocabulary
    voc_cantica = build_unite_vocabulary(lInf_train, lPur_train, lPar_train)
    
    # Compute the log-likelihood of the test data
    log_likelihood_inf = log_likelihood_cantica(voc_cantica, lInf_evaluation)
    log_likelihood_pur = log_likelihood_cantica(voc_cantica, lPur_evaluation)
    log_likelihood_par = log_likelihood_cantica(voc_cantica, lPar_evaluation)
    
    build_score_matrix(log_likelihood_inf, log_likelihood_pur, log_likelihood_par)