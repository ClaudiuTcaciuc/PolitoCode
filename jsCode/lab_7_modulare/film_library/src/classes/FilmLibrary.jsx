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
}

export default filmLibrary;