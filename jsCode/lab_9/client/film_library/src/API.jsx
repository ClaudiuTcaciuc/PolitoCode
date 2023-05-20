import dayjs from "dayjs";
import { film, filmLibrary } from './classes/FilmLibrary';
const URL = "http://localhost:3000/api";

async function getFilmById (id) {
    const response = await fetch(URL + "/film/" + id);
    const data = await response.json();
    if (response.ok) {
        const id = data.id;
        const title = data.title;
        const favorite = data.favorite;
        const watchdate = f.date_watch;
        const rating = data.rating === null ? "Not rated" : data.rating;
        return new film(id, title, favorite, watchdate, rating);
    }
}

async function getFilteredFilms(filter) {   
    const response = await fetch(URL + "/films/"+ filter);
    const data = await response.json();
    if (response.ok) {
        let film_lib = new filmLibrary();
        for (let f of data) {
            console.log(f);
            const id = f.id;
            const title = f.title;
            const favorite = f.favorite;
            const watchdate = f.date_watch;
            const rating = f.rating === null ? "Not rated" : f.rating;
            film_lib.populateLibrary(new film(id, title, favorite, watchdate, rating));
        }
        return film_lib;
    }
}



const API = { getFilmById, getFilteredFilms };
export default API;