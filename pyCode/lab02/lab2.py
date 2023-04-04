import numpy as np
import matplotlib.pyplot as plt
from itertools import combinations as comb
#read data from file
def readData(filename):
    data_matrix = np.loadtxt(filename, delimiter=",", usecols=(0,1,2,3)).reshape(150,4)
    class_label = np.loadtxt(filename, delimiter=",", usecols=(4), dtype=str).reshape(150,1)
    return data_matrix, class_label

def plot_hist(attribute, data_matrix, class_label):
    if(attribute == "Sepal Length"):
        num_attribute = 0
    elif(attribute == "Sepal Width"):
        num_attribute = 1
    elif(attribute == "Petal Length"):
        num_attribute = 2
    elif(attribute == "Petal Width"):
        num_attribute = 3
    data_matrix_iris_setosa = data_matrix[class_label[:,0] == "Iris-setosa"]
    data_matrix_iris_versicolor = data_matrix[class_label[:,0] == "Iris-versicolor"]
    data_matrix_iris_virginica = data_matrix[class_label[:,0] == "Iris-virginica"]
    plt.hist(data_matrix_iris_setosa[:,num_attribute], bins=10, color="blue", alpha=0.5, label="Iris-setosa", density=True, ec = "black")
    plt.hist(data_matrix_iris_versicolor[:,num_attribute], bins=10, color="orange", alpha=0.5, label="Iris-versicolor", density=True, ec = "black")
    plt.hist(data_matrix_iris_virginica[:,num_attribute], bins=10, color="green", alpha=0.5, label="Iris-virginica", density=True, ec = "black")
    plt.legend(loc="upper right", fontsize=10)
    plt.xlabel(attribute)
    plt.show()

def plot_scatter_pairs(attribute_1, attribute_2, data_matrix, class_label):
    if(attribute_1 == "Sepal Length"):
        num_attribute_1 = 0
    elif(attribute_1 == "Sepal Width"):
        num_attribute_1 = 1
    elif(attribute_1 == "Petal Length"):
        num_attribute_1 = 2
    elif(attribute_1 == "Petal Width"):
        num_attribute_1 = 3
    if(attribute_2 == "Sepal Length"):
        num_attribute_2 = 0
    elif(attribute_2 == "Sepal Width"):
        num_attribute_2 = 1
    elif(attribute_2 == "Petal Length"):
        num_attribute_2 = 2
    elif(attribute_2 == "Petal Width"):
        num_attribute_2 = 3
    data_matrix_iris_setosa = data_matrix[class_label[:,0] == "Iris-setosa"]
    data_matrix_iris_versicolor = data_matrix[class_label[:,0] == "Iris-versicolor"]
    data_matrix_iris_virginica = data_matrix[class_label[:,0] == "Iris-virginica"]
    plt.scatter(data_matrix_iris_setosa[:,num_attribute_1], data_matrix_iris_setosa[:,num_attribute_2], color="blue", label="Iris-setosa")
    plt.scatter(data_matrix_iris_versicolor[:,num_attribute_1], data_matrix_iris_versicolor[:,num_attribute_2], color="orange", label="Iris-versicolor")
    plt.scatter(data_matrix_iris_virginica[:,num_attribute_1], data_matrix_iris_virginica[:,num_attribute_2], color="green", label="Iris-virginica")
    plt.legend(loc="upper right", fontsize=10)
    plt.xlabel(attribute_1)
    plt.ylabel(attribute_2)
    plt.show()

if __name__ == "__main__":
    data_matrix, class_label = readData("iris.csv")
    attribute_name = ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"]
    attribute_comb = list(comb(attribute_name, 2))
    for element in attribute_name:
        plot_hist(element, data_matrix, class_label)
    for i in range(len(attribute_comb)):
        plot_scatter_pairs(attribute_comb[i][0], attribute_comb[i][1], data_matrix, class_label)
        plot_scatter_pairs(attribute_comb[i][1], attribute_comb[i][0], data_matrix, class_label)
    
    