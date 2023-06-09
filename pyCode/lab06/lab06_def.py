import sys
import numpy as np
import scipy.special
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

def build_unite_vocabulary(inferno, purgatorio, paradiso):
    vocabulary_train = {}
    alpha = 1.0
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

def predict_class (log_likelihood, class_num):
    score = np.array(log_likelihood).transpose()
    label_test = np.ones(score.shape[1])*class_num
    return calculate_accuracy(score, label_test)
    
def calculate_accuracy (log_score, label_test, number_of_classes=3):
    log_score = log_score + np.log(1/number_of_classes)
    marginal_log_score = scipy.special.logsumexp(log_score, axis=0)
    posterior_log_score = log_score - marginal_log_score
    posterior_score = np.exp(posterior_log_score)
    acc = np.argmax(posterior_score, axis=0) == label_test
    return np.sum(acc)/label_test.shape[0]

def binary_prediction (log_likelihood_one, log_likelihood_two, class_one, class_two):
    #select the rows of the matrix corresponding to the two classes
    score = np.array(log_likelihood_one + log_likelihood_two)
    score_binary = score[:, [class_one, class_two]].transpose()
    label_test = np.concatenate((np.ones(len(log_likelihood_one))*class_one, np.ones(len(log_likelihood_two))*class_two))
    label_test[label_test == class_one] = 0
    label_test[label_test == class_two] = 1
    return calculate_accuracy(score_binary, label_test, 2)

def main():
    Inferno, Purgatorio, Paradiso = load_data()
    
    data_train_inferno, data_test_inferno = split_data(Inferno, 4)
    data_train_purgatorio, data_test_purgatorio = split_data(Purgatorio, 4)
    data_train_paradiso, data_test_paradiso = split_data(Paradiso, 4)

    data_train = build_unite_vocabulary(data_train_inferno, data_train_purgatorio, data_train_paradiso)
    
    inferno_likelihoods = build_log_likelihood(data_test_inferno, data_train)
    purgatorio_likelihoods = build_log_likelihood(data_test_purgatorio, data_train)
    paradiso_likelihoods = build_log_likelihood(data_test_paradiso, data_train)
    
    inferno_accuracy = predict_class(inferno_likelihoods, 0)
    print("Inferno accuracy: ", inferno_accuracy)
    purgatorio_accuracy = predict_class(purgatorio_likelihoods, 1)
    print("Purgatorio accuracy: ", purgatorio_accuracy)
    paradiso_accuracy = predict_class(paradiso_likelihoods, 2)
    print("Paradiso accuracy: ", paradiso_accuracy)
    
    infero_paradiso_accuracy = binary_prediction(inferno_likelihoods, paradiso_likelihoods, 0, 2)
    print("Inferno vs Paradiso accuracy: ", infero_paradiso_accuracy)
    inferno_purgatorio_accuracy = binary_prediction(inferno_likelihoods, purgatorio_likelihoods, 0, 1)
    print("Inferno vs Purgatorio accuracy: ", inferno_purgatorio_accuracy)
    purgatorio_paradiso_accuracy = binary_prediction(purgatorio_likelihoods, paradiso_likelihoods, 1, 2)
    print("Purgatorio vs Paradiso accuracy: ", purgatorio_paradiso_accuracy)

if __name__ == '__main__':
    main()