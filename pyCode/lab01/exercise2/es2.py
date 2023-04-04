import argparse
parser = argparse.ArgumentParser()
parser.add_argument('filename')
parser.add_argument('-b', '--bus_ID', type=int)
parser.add_argument('-l', '--bus_number', type=int)
args = parser.parse_args()
class Bus:
    ID: int
    Number: int
    Coordinate_X: int
    Coordinate_Y: int
    Time: int
    
    def __init__(self, ID:int, Number:int, Coordinate_X:int, Coordinate_Y:int, Time:int):
        self.ID = ID
        self.Number = Number
        self.Coordinate_X = Coordinate_X
        self.Coordinate_Y = Coordinate_Y
        self.Time = Time
    
    def __str__(self):
        return f"ID: {self.ID}, Number: {self.Number}, Coordinate_X: {self.Coordinate_X}, Coordinate_Y: {self.Coordinate_Y}, Time: {self.Time}"
    
    def __repr__(self):
        return self.__str__()
    
    def __eq__(self, other):
        return self.ID == other.ID
    
with open(args.filename, 'r') as file:
    data = [Bus(*map(int, line.split())) for line in file.readlines()]

space_travelled = []
total_distance = 0

if args.bus_ID:
    distance_tot = 0
    for bus in data:
        if bus.ID == args.bus_ID:
            space_travelled.append((bus.Coordinate_X, bus.Coordinate_Y))
    for i in range (len(space_travelled)-1): 
        distance_X = space_travelled[i+1][0] - space_travelled[i][0]
        distance_Y = space_travelled[i+1][1] - space_travelled[i][1]
        distance_tot += (distance_X + distance_Y**2)**0.5
    print(distance_tot)

if args.bus_number:
    time_travelled = {}
    bus_space_travelled = {}
    distance_per_bus = 0
    total_speed = 0
    total_time_per_bus = 0
    for bus in data:
        if bus.Number == args.bus_number:
            if bus.ID not in bus_space_travelled:
                bus_space_travelled[bus.ID] = [(bus.Coordinate_X, bus.Coordinate_Y)]
                time_travelled[bus.ID] = [bus.Time]
            else:
                bus_space_travelled[bus.ID].append((bus.Coordinate_X, bus.Coordinate_Y))
                time_travelled[bus.ID].append(bus.Time)
    for busID, busSpace in bus_space_travelled.items():
        for i in range (len(busSpace)-1): 
            distance_X = busSpace[i+1][0] - busSpace[i][0]
            distance_Y = busSpace[i+1][1] - busSpace[i][1]
            distance_per_bus += (distance_X + distance_Y**2)**0.5
        bus_space_travelled[busID] = distance_per_bus
        distance_per_bus = 0
    for busID, busTime in time_travelled.items():
        for i in range (len(busTime)-1):
            total_time_per_bus += busTime[i+1] - busTime[i]
        time_travelled[busID] = total_time_per_bus
        total_time_per_bus = 0
    print(sum(bus_space_travelled.values())/sum(time_travelled.values()))