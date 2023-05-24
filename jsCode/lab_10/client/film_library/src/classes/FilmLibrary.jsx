import dayjs from "dayjs";

class film {
    constructor(id, title, favorite, watchdate, rating) {
        this.id = id;
        this.title = title;
        this.favorite = favorite;
        this.watchdate = watchdate === null ? null : dayjs(watchdate);
        this.rating = rating;
    }
    toString() {
        return `ID: ${this.id}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.watchdate === null ? "not watched" : this.watchdate.format("MMMM DD, YYYY")}, Rating: ${this.rating}`;
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
            if (a.watchdate === null && b.watchdate === null) return a.id - b.id;
            else if (a.watchdate === null) return 1;
            else if (b.watchdate === null) return -1;
            else return a.watchdate.diff(b.watchdate);
        });
    }
    deleteFilm(id) {
        let index = this.films.findIndex(film => film.id === id);
        this.films.splice(index, 1);
    }
    resetWatchedFilms() {
        for (let element of this.films) {
            element.watchdate = null;
        }
    }
    getRatedFilms() {
        return this.films.filter(film => film.rating !== null).sort((a, b) => b.rating - a.rating);
    }
    updateFavorite(id, favorite) {
        let index = this.films.findIndex(film => film.id === id);
        this.films[index].favorite = favorite;
    }
    getLastID() {
        return this.films[this.films.length - 1].id;
    }
    getPositionInArray(id) {
        return this.films.findIndex(film => film.id === id);
    }
}

let film_library = new filmLibrary();
film_library.populateLibrary(new film(1, "The Godfather", true, "March 25, 2019", 1));
film_library.populateLibrary(new film(2, "The Shawshank Redemption", false, "April 15, 2019", 5));
film_library.populateLibrary(new film(3, "The Dark Knight", true, "January 01, 2021", null));
film_library.populateLibrary(new film(4, "The Godfather: Part II", false, "August 25, 2022", 4));
film_library.populateLibrary(new film(5, "The Lord of the Rings: The Return of the King", true, "August 04, 2021", null));


export {film, filmLibrary, film_library};
