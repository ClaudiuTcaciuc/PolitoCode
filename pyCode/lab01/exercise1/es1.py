import sys
import tabulate
# Ottenere il nome del file passato come argomento della riga di comando
filename = sys.argv[1]

# Aprire il file e leggere i contenuti
with open(filename, 'r') as file:
    athlet = file.read()
    
# Ritorna lo score degli atleti
def return_athlet_score(athlet_score):
    return athlet_score['score']

athlet_score = []
nation_score = {}

# Creare una lista di dizionari con le informazioni degli atleti
for elements in athlet.split('\n'):
    #calcolo dello score
    for score_elemets in elements.split()[3::]:
        score = sum(map(float, elements.split()[3::]))
    score = score - min (map(float, elements.split()[3::])) - max (map(float, elements.split()[3::]))
    #creazione della lista di dizionari
    athlet_name = elements.split()[0:2]
    athlet_nations = elements.split()[2:3]
    athlet_score.append({'athlet':athlet_name,'nation':athlet_nations, 'score': score})

for elements in athlet_score:
    if elements['nation'][0] not in nation_score.keys():
        nation_score[elements['nation'][0]] = elements['score']
    else:
        nation_score[elements['nation'][0]] += elements['score']
        
#stampa dei risultati
athlet_score.sort(key=return_athlet_score, reverse=True)
header = ['Atleta', 'Nazionalità', 'Score']
rows = [x.values() for x in athlet_score[:3]]
print(tabulate.tabulate(rows, header, tablefmt="grid"))
header = ['Nazionalità', 'Score']
max_nation = max(nation_score, key = nation_score.get)
rows = [[max_nation, nation_score[max_nation]]]
print(tabulate.tabulate(rows, header, tablefmt="grid"))