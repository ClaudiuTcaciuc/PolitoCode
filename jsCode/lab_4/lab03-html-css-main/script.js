"use strict";
 
let id = 0;

class film{
    constructor(ID_film, title, favorite, date_watch, rating){
        this.ID_film = ID_film;
        this.title = title;
        this.favorite = favorite;
        this.date_watch = date_watch === null ? null : dayjs(date_watch); 
        this.rating = rating;
    }
    toString(){
        return `ID: ${this.ID_film}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.date_watch === null ? "not watched" : this.date_watch.format("MMMM DD, YYYY")}, Rating: ${this.rating}`;
    }
}

class filmLibrary {
    constructor(){
        this.films = [];
    }
    populateLibrary(film){
        this.films.push(film)
    }
    printLibrary(){
        this.films.forEach(film => console.log(film.toString()));
    }
    sortByDateWatch(){
        return [...this.films].sort((a, b) =>{
            if (a.date_watch === null && b.date_watch === null) return a.ID_film - b.ID_film;
            else if (a.date_watch === null) return 1;
            else if (b.date_watch === null) return -1;
            else return a.date_watch.diff(b.date_watch);
        });
    }
    deleteFilm(ID_film){
        let index = this.films.findIndex(film => film.ID_film === ID_film);
        this.films.splice(index, 1);
    }
    resetWatchedFilms(){
        for (let element of this.films){
            element.date_watch = null;
        }
    }
    getRatedFilms(){
        return this.films.filter(film => film.rating !== null).sort((a,b) => b.rating - a.rating);
    }
}

let film_library = new filmLibrary();
film_library.populateLibrary(new film(1, "The Godfather", true, "March 25, 2019", 1));
film_library.populateLibrary(new film(2, "The Shawshank Redemption", false, "April 15, 2019", 5));
film_library.populateLibrary(new film(3, "The Dark Knight", true, "January 01, 2021", null));
film_library.populateLibrary(new film(4, "The Godfather: Part II", false, "August 25, 2022", 4));
film_library.populateLibrary(new film(5, "The Lord of the Rings: The Return of the King", true, "August 04, 2021", null));

function populateTableFromLibrary(){
    changeColorFilterOnClick("filter-all");
    for (let film_in_library of film_library.films){
        addRow(film_in_library);
    }
}

function populateTableFromForm(){
    let title = document.getElementById("titleFilm").value;
    let favorite = document.getElementById("favoriteFilm").checked;
    let date_watch = document.getElementById("dateFilm").value;
    let rating = document.getElementById("ratingFilm").value;
    let film_to_add = new film(++id, title, favorite, date_watch, rating);
    film_library.populateLibrary(film_to_add);
    addRow(film_to_add);
}

function addRow(film_to_add){
    let title = film_to_add.title;
    let favorite = film_to_add.favorite;
    let date_watch = film_to_add.date_watch;
    let rating = film_to_add.rating;
    
    let table = document.getElementById("tableBody");
    let row = document.createElement("tr");
    let cell1 = document.createElement("td");
    let cell2 = document.createElement("td");
    let innerCell2 = document.createElement("label");
    let cell3 = document.createElement("td");
    let cell4 = document.createElement("td");
    //title
    cell1.innerHTML = title;
    //color title if favorite
    if (favorite === true){
        cell1.style.color = "red";
    }
    else
        cell1.style.color = "black";
    //favorite checkbox with change color title
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "checkSquare";
    checkbox.checked = favorite;
    checkbox.onclick = function(){
        let index = film_library.films.findIndex(film => film.title === title);
        if (this.checked === true){
            //change color only for title entry
            cell1.style.color = "red";
            //change favorite value in library
            
            film_library.films[index].favorite = true;
        }
        else{
            cell1.style.color = "black";
            film_library.films[index].favorite = false;
        }
    };
    cell2.appendChild(checkbox);
    innerCell2.innerHTML = "&nbsp;favorite";
    cell2.appendChild(innerCell2);
    //date watched
    //da sistemare
    if(dayjs(date_watch).isValid() === false)
        date_watch = "not watched";
    else
        date_watch = dayjs(date_watch).format("DD/MM/YYYY");
    cell3.innerHTML = date_watch
    //rating stars
    if(rating !== null){
        let starRating = document.createElement("div");
        starRating.className = "star-rating";
        starRating.id = "starRating";
        starRating.role = "rating";
        for (let i = 0; i<5; i++){
            let star = document.createElement("span");
            star.className = "star-notification";
            if(i<rating)
                star.innerHTML = "&#9733;";
            else
                star.innerHTML = "&#9734;";
            starRating.appendChild(star);
        }
        cell4.appendChild(starRating);
    }
    else
        cell4.innerHTML = "not rated";
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);

    table.appendChild(row);
}

function replaceTitle(filter_type){
    //replace title
    let filter_title = document.getElementById("filter-title");
    filter_title.remove();
    let new_filter_title = document.createElement("h1");
    let new_main = document.getElementById("filter-pos");
    new_filter_title.id = "filter-title";
    new_filter_title.class = "mb-2";
    new_filter_title.innerHTML = filter_type
    new_main.appendChild(new_filter_title);
}

function replaceTable(){
    //replace table
    let table_body = document.getElementById("tableBody");
    table_body.remove();
    let new_table_body = document.createElement("tbody");
    let new_table = document.getElementById("filmTable");
    new_table_body.id = "tableBody";
    new_table.appendChild(new_table_body);
}

function showAll(){
    replaceTitle("All");
    replaceTable();
    changeColorFilterOnClick("filter-all")
    populateTableFromLibrary();
}

function showFavorite(){
    replaceTitle("Favorite");
    replaceTable();
    changeColorFilterOnClick("filter-favorites")
    for (let element of film_library.films){
        if(element.favorite === true)
            addRow(element);
    }
}

function showBestRated(){
    replaceTitle("Best Rated");
    replaceTable();
    changeColorFilterOnClick("filter-best")
    for (let element of film_library.getRatedFilms()){
        if(element.rating == 5)
            addRow(element);
    }
}

function showWatchedLastMonth(){
    replaceTitle("Watched Last Month");
    replaceTable();
    changeColorFilterOnClick("filter-seen-last-month")
    let last_month = dayjs().month(dayjs().month() - 1);
    for (let element of film_library.films){
        if (element.date_watch !== null && element.date_watch.month() === last_month.month())
            addRow(element);
    }
}

function showUnseen(){
    replaceTitle("Unseen");
    replaceTable();
    changeColorFilterOnClick("filter-unseen")
    for (let element of film_library.films){
        if (dayjs(element.date_watch).isValid() === false)
            addRow(element);
    }
}

function emptyForm(){
    document.getElementById("titleFilm").value = "";
    document.getElementById("favoriteFilm").checked = false;
    document.getElementById("dateFilm").value = "";
    document.getElementById("ratingFilm").value = "";
}

function changeColorFilterOnClick(id){
    let filter = document.getElementById(id);
    filter.style.backgroundColor = "DarkBlue";
    filter.style.color = "white";
    let filter_all = document.getElementsByClassName("list-group-item list-group-item-action");
    for (let element of filter_all){
        if(element.id !== id){
            element.style.backgroundColor = "white";
            element.style.color = "black";
        }
    }
}

populateTableFromLibrary();