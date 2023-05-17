import numpy as np
import matplotlib.pyplot as plt
import scipy.special as sp
def pretty_print_dict(obj: dict):
  import json
  print(json.dumps(obj, indent=4))

def load_data ():
    list_inferno = []
    list_purgatorio = []
    list_paradiso = []
    
    inferno = open('DivinaCommedia/inferno.txt', encoding="ISO-8859-1")
    purgatorio = open('DivinaCommedia/purgatorio.txt', encoding="ISO-8859-1")
    paradiso = open('DivinaCommedia/paradiso.txt', encoding="ISO-8859-1")
    
    for line in inferno:
        list_inferno.append(line.strip())
    inferno.close()
    
    for line in purgatorio:
        list_purgatorio.append(line.strip())   
    purgatorio.close()
    
    for line in paradiso:
        list_paradiso.append(line.strip())
    paradiso.close()
    
    return list_inferno, list_purgatorio, list_paradiso

def split_data (lines, n):
    data_train = []
    data_test = []
    for i, line in enumerate(lines):
        if i % n == 0:
            data_test.append(line)
        else:
            data_train.append(line)
    return data_train, data_test

def build_vocabulary (list):
    vocabulary = {}
    for line in list:
        for word in line.split():
            if word not in vocabulary:
                vocabulary[word] = 1
            else:
                vocabulary[word] += 1
    return vocabulary

def build_unite_vocabulary(inferno, purgatorio, paradiso, alpha=0.001):
    vocabulary_train = {}
    vocabulary_inferno = build_vocabulary(inferno)
    vocabulary_purgatorio = build_vocabulary(purgatorio)
    vocabulary_paradiso = build_vocabulary(paradiso)
    
    # Aggiungi tutte le parole distinte di tutti i dizionari a vocabulary_train
    for word in set(vocabulary_inferno.keys()) | set(vocabulary_purgatorio.keys()) | set(vocabulary_paradiso.keys()):
        count_voc_inferno = vocabulary_inferno.get(word, 0) + alpha
        count_voc_purgatorio = vocabulary_purgatorio.get(word, 0) + alpha
        count_voc_paradiso = vocabulary_paradiso.get(word, 0) + alpha
        vocabulary_train[word] = [(count_voc_inferno/sum(vocabulary_inferno.values())), (count_voc_purgatorio/sum(vocabulary_purgatorio.values())), (count_voc_paradiso/sum(vocabulary_paradiso.values()))]
    return vocabulary_train

def predict_likelihood(terzina, vocab_train):
    log_likelihoods = np.zeros(3)
    for word in terzina.split():
        if word in vocab_train:
            log_likelihoods += np.log(vocab_train[word])
    return log_likelihoods

def build_log_likelihood (data_test, vocab_train):
    log_likelihoods = []
    for line in data_test:
        log_likelihoods.append(predict_likelihood(line, vocab_train))
    return log_likelihoods

def build_ll_cantica (log_inf, log_pur, log_par):
    score = np.array (log_inf + log_pur + log_par).transpose()
    label = np.concatenate([np.zeros(len(log_inf)), np.ones(len(log_pur)), np.ones(len(log_par))*2])
    return score, label

def main():
    Inferno, Purgatorio, Paradiso = load_data() 

    data_train_inferno, data_test_inferno = split_data(Inferno, 4)
    data_train_purgatorio, data_test_purgatorio = split_data(Purgatorio, 4)
    data_train_paradiso, data_test_paradiso = split_data(Paradiso, 4)
    alpha = 0.001

    data_train = build_unite_vocabulary(data_train_inferno, data_train_purgatorio, data_train_paradiso, alpha)

    inferno_likelihoods = build_log_likelihood(data_test_inferno, data_train)
    purgatorio_likelihoods = build_log_likelihood(data_test_purgatorio, data_train)
    paradiso_likelihoods = build_log_likelihood(data_test_paradiso, data_train)

    commedia_ll, commedia_label = build_ll_cantica(inferno_likelihoods, purgatorio_likelihoods, paradiso_likelihoods)
    cost_matrix = np.array([[0, 1, 2], [1, 0, 1], [2, 1, 0]])
    prior_vector = np.array([0.3, 0.4, 0.3])
    commedia_ll = commedia_ll + np.log(prior_vector.reshape(-1, 1))
    marginal_log_score = sp.logsumexp(commedia_ll, axis=0)
    posterior_log_score = commedia_ll - marginal_log_score
    posterior_score = np.exp(posterior_log_score)

    costs = np.dot(cost_matrix, posterior_score)
    optimal_classes = np.argmin(costs, axis=0)
    confusion_matrix = np.zeros((3, 3))
    for true_class, pred_class in zip(commedia_label, optimal_classes):
        confusion_matrix[int(true_class), int(pred_class)] += 1

    dummy_cost = np.min(np.dot(cost_matrix, prior_vector))
    missclassification_ratios = confusion_matrix / np.sum(confusion_matrix, axis=1, keepdims=True)
    
    DCF = np.sum(prior_vector * np.sum(missclassification_ratios * cost_matrix, axis=1))

    normalized_DCF = DCF / dummy_cost
    print ("confusion_matrix: \n", confusion_matrix)
    print ("DCF: \n", DCF)
    print ("normalized_DCF: \n", normalized_DCF)
    
if __name__ == '__main__':
    main()
