import sys
import calendar
class Person:
    Name: str
    Surname: str
    City: str
    Date_birth: str
    
    def __init__(self, Name:str, Surname:str, City:str, Date_birth:str):
        self.Name = Name
        self.Surname = Surname
        self.City = City
        self.Date_birth = Date_birth
    
    def __str__(self):
        return f"Name: {self.Name}, Surname:{self.Surname}, City: {self.City}, Date_birth: {self.Date_birth}"
    
    def __reprt__(self):
        return self.__str__()

with open(sys.argv[1], 'r') as file:
    data = [Person(*line.split()) for line in file.readlines()]

#births per city
births_per_city = {}
for person in data:
    if person.City not in births_per_city:
        births_per_city[person.City] = 1
    else:
        births_per_city[person.City] += 1
print(births_per_city)

#births per month
births_per_month = {}
for person in data:
    month = calendar.month_name[int (person.Date_birth.split('/')[1])]
    if month not in births_per_month:
        births_per_month[month] = 1
    else:
        births_per_month[month] += 1
print(births_per_month)

#average number of births per city
avg_births_per_city = sum(births_per_city.values())/len(births_per_city)
print(avg_births_per_city)