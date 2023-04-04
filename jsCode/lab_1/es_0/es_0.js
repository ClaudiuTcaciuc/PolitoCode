let array_string = ["spring", "summer", "fall", "winter", "it", "cat", " "];
let array_modified = [];
for (element of array_string) {
    if (element.length > 1) 
        array_modified.push(element[0]+element[1]+element[element.length-2]+element[element.length-1]);
    else
        array_modified.push("");
}
console.log(array_modified);