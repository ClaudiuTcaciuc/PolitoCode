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

def build_unite_vocabulary(inferno, purgatorio, paradiso):
    vocabulary_train = {}
    alpha = 0.001
    vocabulary_inferno = build_vocabulary(inferno)
    vocabulary_purgatorio = build_vocabulary(purgatorio)
    vocabulary_paradiso = build_vocabulary(paradiso)
    
    # Aggiungi tutte le parole distinte di tutti i dizionari a vocabulary_train
    for word in set(vocabulary_inferno.keys()) | set(vocabulary_purgatorio.keys()) | set(vocabulary_paradiso.keys()):
        count_voc_inferno = vocabulary_inferno.get(word, alpha)
        count_voc_purgatorio = vocabulary_purgatorio.get(word, alpha)
        count_voc_paradiso = vocabulary_paradiso.get(word, alpha)
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
    confusione_matrix = np.zeros((number_of_classes, number_of_classes))
    for i in range(number_of_classes):
        for j in range(number_of_classes):
            confusione_matrix[i][j] = np.sum(np.argmax(posterior_score, axis=0)[label_test == j] == i)
    return np.sum(acc)/label_test.shape[0], confusione_matrix

def commedia_prediction (inferno_log, purgatorio_log, paradiso_log):
    score_commedia = np.array(inferno_log + purgatorio_log + paradiso_log ).transpose()
    label_commedia = np.concatenate((np.ones(len(inferno_log))*0, np.ones(len(purgatorio_log))*1, np.ones(len(paradiso_log))*2))
    return calculate_accuracy(score_commedia, label_commedia, 3)



def main():
    Inferno, Purgatorio, Paradiso = load_data()
    
    data_train_inferno, data_test_inferno = split_data(Inferno, 4)
    data_train_purgatorio, data_test_purgatorio = split_data(Purgatorio, 4)
    data_train_paradiso, data_test_paradiso = split_data(Paradiso, 4)

    data_train = build_unite_vocabulary(data_train_inferno, data_train_purgatorio, data_train_paradiso)
    
    inferno_likelihoods = build_log_likelihood(data_test_inferno, data_train)
    purgatorio_likelihoods = build_log_likelihood(data_test_purgatorio, data_train)
    paradiso_likelihoods = build_log_likelihood(data_test_paradiso, data_train)
    
    ovverall_accuracy, confusione_matrix = commedia_prediction(inferno_likelihoods, purgatorio_likelihoods, paradiso_likelihoods)
    print("Overall accuracy: ", ovverall_accuracy)
    print("Confusion matrix: ")
    for i in range(3):
        print(confusione_matrix[i])

if __name__ == '__main__':
    main()