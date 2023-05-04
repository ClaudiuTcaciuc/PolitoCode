import sys
import numpy as np

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

if __name__ == '__main__':

    # Load the tercets and split the lists in training and test lists
    
    lInf, lPur, lPar = load_data()

    lInf_train, lInf_evaluation = split_data(lInf, 4)
    lPur_train, lPur_evaluation = split_data(lPur, 4)
    lPar_train, lPar_evaluation = split_data(lPar, 4)
    
    # Create the vocabulary
    voc_cantica = build_unite_vocabulary(lInf_train, lPur_train, lPar_train)
    