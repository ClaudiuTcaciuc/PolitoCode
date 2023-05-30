import numpy as np
import matplotlib.pyplot as plt
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
        vocabulary_train[word] = [(count_voc_inferno/sum(vocabulary_inferno.values())), 
                                  (count_voc_purgatorio/sum(vocabulary_purgatorio.values())),
                                  (count_voc_paradiso/sum(vocabulary_paradiso.values()))]
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

def build_binary_ll_ratio (log_one, log_two, class_one, class_two):
    score_ratio = np.array(log_one + log_two).transpose()
    ll_ratio = score_ratio[class_one] - score_ratio[class_two]
    label_binary = np.concatenate((np.ones(len(log_one)) * class_one, np.ones(len(log_two)) * class_two))
    label_binary[label_binary == class_one] = 1
    label_binary[label_binary == class_two] = 0
    return ll_ratio, label_binary

def cost_matrix_prior_prob (pi, cost_false_positive, cost_false_negative):
    cost_mat =  np.array([[0, cost_false_negative], [cost_false_positive, 0]])
    prior_class_prob = np.array([1-pi, pi])
    threshold = -np.log(pi * cost_false_negative) + np.log((1 - pi) * cost_false_positive)
    return threshold, cost_mat, prior_class_prob

def make_decision (ll_ratio, threshold):
    decision = np.where(ll_ratio > threshold, 1, 0)
    return decision

def calculate_confusion_matric (decisions, labels, num_classes=3):
    confusion_matrix = np.zeros((num_classes, num_classes))
    for i in range(num_classes):
        for j in range(num_classes):
            confusion_matrix[i][j] = np.sum((decisions == i) & (labels == j))
    return confusion_matrix

def compute_DCF_normalized (confusion_matrix, prior_class_prob, cost_mat):
    false_positive_rate = confusion_matrix[1][0] / (confusion_matrix[0][0] + confusion_matrix[1][0])
    false_negative_rate = confusion_matrix[0][1] / (confusion_matrix[0][1] + confusion_matrix[1][1])

    empirical_bayes_risk = prior_class_prob[1]*cost_mat[0][1]*false_negative_rate + prior_class_prob[0]*cost_mat[1][0]*false_positive_rate
    empirical_bayes_risk_dummy = min (prior_class_prob[1]*cost_mat[0][1], prior_class_prob[0]*cost_mat[1][0])
    empirical_bayes_risk_normal = empirical_bayes_risk / empirical_bayes_risk_dummy

    return empirical_bayes_risk_normal, false_positive_rate, false_negative_rate

def plot_figure (x_label, y_label, x_data, y_data, title):
    plt.plot(x_data, y_data)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.title(title)
    plt.grid(True)
    plt.show()

def bayes_error_plot (eff_prior_log_odds, normalized_DCF, normalized_minDCF):
    plt.plot(eff_prior_log_odds, normalized_DCF, label='DCF', color='r')
    plt.plot(eff_prior_log_odds, normalized_minDCF, label='minDCF', color='b')
    plt.ylim([0, 1.1])
    plt.xlim([-3, 3])
    plt.show()

def compute_min_DCF (scores, labels, prior_class_prob, cost_mat):
    sorted_scores = np.sort(scores)
    min_DCF = float('inf')
    best_threshold = None
    for i in range(len(sorted_scores)):
        
        threshold = sorted_scores[i]
        decisions = make_decision(scores, threshold)
        confusion_matrix = calculate_confusion_matric(decisions, labels)
        empirical_bayes_risk_normal, _, _ = compute_DCF_normalized(confusion_matrix, prior_class_prob, cost_mat)
        if empirical_bayes_risk_normal < min_DCF:
            min_DCF = empirical_bayes_risk_normal
            best_threshold = threshold
    return min_DCF, best_threshold

def compute_ROC (scores, labels, confusion_matrix, prior_class_prob, cost_mat):
    sorted_scores = np.sort(scores)
    false_positive_vector = np.zeros(len(scores))
    false_negative_vector = np.zeros(len(scores))
    true_positive_vector = np.zeros(len(scores))
    for i in range(len(scores)):
        threshold = sorted_scores[i]
        decision = make_decision(scores, threshold)
        confusion_matrix = calculate_confusion_matric(decision, labels)
        _, false_positive_vector[i], false_negative_vector[i] = compute_DCF_normalized(confusion_matrix, prior_class_prob, cost_mat)
    true_positive_vector = 1 - false_negative_vector 
    plot_figure('FPR', 'TPR', false_positive_vector, true_positive_vector, 'ROC Curve')

def compute_bayes_error (scores, labels):
    eff_prior_log_odds = np.linspace(-3, 3, 21)
    eff_prior = 1 / (1 + np.exp(-eff_prior_log_odds))
    normalized_DCF = []
    normalized_minDCF = []
    for eff in eff_prior:
        threshold, cost_mat, prior_class_prob = cost_matrix_prior_prob(eff, 1, 1)
        decisions = make_decision(scores, threshold)
        confusion_matrix = calculate_confusion_matric(decisions, labels)
        DCF, _, _ = compute_DCF_normalized(confusion_matrix, prior_class_prob, cost_mat)
        normalized_DCF.append(DCF)
        min_DCF, _ = compute_min_DCF(scores, labels, prior_class_prob, cost_mat)
        normalized_minDCF.append(min_DCF)
    bayes_error_plot(eff_prior_log_odds, normalized_DCF, normalized_minDCF)

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

    pi = 0.5
    cost_false_positive = 1
    cost_false_negative = 1
    threshold, cost_mat, prior_class_prob = cost_matrix_prior_prob(pi, cost_false_positive, cost_false_negative)
    infpar_ll_ratio, infpar_label = build_binary_ll_ratio(inferno_likelihoods, paradiso_likelihoods, 0, 2)

    infpar_decision = make_decision(infpar_ll_ratio, threshold)
    infpar_confusion_matrix = calculate_confusion_matric(infpar_decision, infpar_label, 2)
    
    empirical_bayes_risk_normal, _, _ = compute_DCF_normalized(infpar_confusion_matrix, prior_class_prob, cost_mat)
    
    print("Empirical Bayes Risk Normalized: ", empirical_bayes_risk_normal)
    print("Confusion Matrix: ")
    for i in range(len(infpar_confusion_matrix)):
        print(infpar_confusion_matrix[i])
        
    min_DCF, best_threshold = compute_min_DCF(infpar_ll_ratio, infpar_label, prior_class_prob, cost_mat)
    print("Minimum DCF: ", min_DCF)
    print("Best Threshold: ", best_threshold)
    compute_ROC(infpar_ll_ratio, infpar_label, infpar_confusion_matrix, prior_class_prob, cost_mat)
    compute_bayes_error(infpar_ll_ratio, infpar_label)
    
if __name__ == '__main__':
    main()
