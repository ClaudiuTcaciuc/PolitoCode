import dayjs from "dayjs";

class film {
    constructor(ID_film, title, favorite, date_watch, rating) {
        this.ID_film = ID_film;
        this.title = title;
        this.favorite = favorite;
        this.date_watch = date_watch === null ? null : dayjs(date_watch);
        this.rating = rating;
    }
    toString() {
        return `ID: ${this.ID_film}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.date_watch === null ? "not watched" : this.date_watch.format("MMMM DD, YYYY")}, Rating: ${this.rating}`;
    }
}


class filmLibrary {
    constructor() {
        this.films = [];
    }
    populateLibrary(film) {
        this.films.push(film)
    }
    printLibrary() {
        this.films.forEach(film => console.log(film.toString()));
    }
    sortByDateWatch() {
        return [...this.films].sort((a, b) => {
            if (a.date_watch === null && b.date_watch === null) return a.ID_film - b.ID_film;
            else if (a.date_watch === null) return 1;
            else if (b.date_watch === null) return -1;
            else return a.date_watch.diff(b.date_watch);
        });
    }
    deleteFilm(ID_film) {
        let index = this.films.findIndex(film => film.ID_film === ID_film);
        this.films.splice(index, 1);
    }
    resetWatchedFilms() {
        for (let element of this.films) {
            element.date_watch = null;
        }
    }
    getRatedFilms() {
        return this.films.filter(film => film.rating !== null).sort((a, b) => b.rating - a.rating);
    }
    updateFavorite(ID_film, favorite) {
        let index = this.films.findIndex(film => film.ID_film === ID_film);
        this.films[index].favorite = favorite;
    }
    getLastID() {
        return this.films[this.films.length - 1].ID_film;
    }
    getPositionInArray(ID_film) {
        return this.films.findIndex(film => film.ID_film === ID_film);
    }
}

let film_library = new filmLibrary();
film_library.populateLibrary(new film(1, "The Godfather", true, "March 25, 2019", 1));
film_library.populateLibrary(new film(2, "The Shawshank Redemption", false, "April 15, 2019", 5));
film_library.populateLibrary(new film(3, "The Dark Knight", true, "January 01, 2021", null));
film_library.populateLibrary(new film(4, "The Godfather: Part II", false, "August 25, 2022", 4));
film_library.populateLibrary(new film(5, "The Lord of the Rings: The Return of the King", true, "August 04, 2021", null));


export {film, filmLibrary, film_library};
