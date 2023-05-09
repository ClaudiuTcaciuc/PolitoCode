import sys
import numpy as np

def pretty_print_dict(obj: dict):
  import json
  print(json.dumps(obj, indent=4))

def load_data ():
    list_inferno = []
    list_purgatorio = []
    list_paradiso = []
    
    inferno = open('data/inferno.txt', encoding="ISO-8859-1")
    purgatorio = open('data/purgatorio.txt', encoding="ISO-8859-1")
    paradiso = open('data/paradiso.txt', encoding="ISO-8859-1")
    
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

def split_data (list, n):
    data_train, data_test = [], []
    for i in range (len(list)):
        if i % n == 0:
            data_test.append(list[i])
        else:
            data_train.append(list[i])
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

def build_unite_vocabulary(inferno, purgatorio, paradiso):
    vocabulary_train = {}
    alpha = 0.001
    vocabulary_inferno = build_vocabulary(inferno)
    vocabulary_purgatorio = build_vocabulary(purgatorio)
    vocabulary_paradiso = build_vocabulary(paradiso)
    
    # Aggiungi tutte le parole distinte di tutti i dizionari a vocabulary_train
    for word in set(vocabulary_inferno.keys()) | set(vocabulary_purgatorio.keys()) | set(vocabulary_paradiso.keys()):
        freq_voc_inferno = vocabulary_inferno.get(word, 0)
        freq_voc_purgatorio = vocabulary_purgatorio.get(word, 0)
        freq_voc_paradiso = vocabulary_paradiso.get(word, 0)
        vocabulary_train[word] = [(freq_voc_inferno/len(vocabulary_inferno))+alpha, (freq_voc_purgatorio/len(vocabulary_purgatorio))+alpha, (freq_voc_paradiso/len(vocabulary_paradiso))+alpha]
    return vocabulary_train

def cantica_prediction(data_train, data_test):
    log_likelihood = []
    for line in data_test:
        for word in line.split():
            log_likelihood_tercet = 0
            if word in data_train:
                log_likelihood_tercet += np.log(data_train[word])
            else:
                log_likelihood_tercet = [0, 0, 0]
        log_likelihood.append(sum(log_likelihood_tercet))
    return log_likelihood


if __name__ == '__main__':
    Inferno, Purgatorio, Paradiso = load_data()
    
    data_train_inferno, data_test_inferno = split_data(Inferno, 4)
    data_train_purgatorio, data_test_purgatorio = split_data(Purgatorio, 4)
    data_train_paradiso, data_test_paradiso = split_data(Paradiso, 4)

    data_train = build_unite_vocabulary(data_train_inferno, data_train_purgatorio, data_train_paradiso)
    
    log_likelihood_inferno = cantica_prediction(data_train, data_test_inferno)
    log_likelihood_purgatorio = cantica_prediction(data_train, data_test_purgatorio)
    log_likelihood_paradiso = cantica_prediction(data_train, data_test_paradiso)
    
    score_matrix = build_score_matrix(log_likelihood_inferno, log_likelihood_purgatorio, log_likelihood_paradiso)