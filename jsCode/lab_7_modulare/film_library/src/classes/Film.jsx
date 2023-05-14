import dayjs from 'dayjs';

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

export default film;