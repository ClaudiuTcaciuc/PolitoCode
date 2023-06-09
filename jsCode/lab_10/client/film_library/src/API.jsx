import { film, filmLibrary } from './classes/FilmLibrary';
const URL = "http://localhost:3000/api";

async function getFilmById (id) {
    const response = await fetch(URL + "/film/" + id, {
        credentials: "include",
    });
    const data = await response.json();
    if (response.ok) {
        const id = data.id;
        const title = data.title;
        const favorite = data.favorite;
        const watchdate = f.watchdate;
        const rating = data.rating === null ? "Not rated" : data.rating;
        return new film(id, title, favorite, watchdate, rating);
    }
}

async function getFilteredFilms(filter) {   
    const response = await fetch(URL + "/films/"+ filter, {
        credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    if (response.ok) {
        let film_lib = new filmLibrary();
        for (let f of data) {
            const id = f.id;
            const title = f.title;
            const favorite = f.favorite;
            const watchdate = f.watchdate;
            const rating = f.rating === null ? "Not rated" : f.rating;
            film_lib.populateLibrary(new film(id, title, favorite, watchdate, rating));
        }
        return film_lib;
    }
}

async function addNewFilmLib (film) {
    try {
        film.user = 1;
        film.watchdate = film.watchdate.format("YYYY-MM-DD");
        const response = await fetch (URL + "/addfilm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(film),
            }
        );
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateFilmLib (film) {
    try {
        film.user = 1;
        const response = await fetch (URL + "/updatefilm/" + film.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(film),
        });
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

async function deleteFilmLib (id) {
    try {
        const response = await fetch (URL + "/deletefilm/" + id, {
                method: "DELETE",
                credentials: "include",
        });
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateFavInline (film) {
    try {
        const response = await fetch ( URL + "/setfavorite/" + film.id, {
            method : "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(film),
        });
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

async function updateRateInline (film) {
    try {
        const response = await fetch ( URL + "/updaterating/" + film.id, {
            method : "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(film),
        });
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}

async function logIn (credentials) {
    let response = await fetch(URL + "/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    }
    else {
        const err = await response.json();
        throw err.message;
    }
}

async function logOut () {
    await fetch(URL + "/sessions/current", {
        method: "DELETE",
        credentials: "include",
    });
}

async function getUserInfo () {
    const response = await fetch (URL + "/sessions/current", {
        credentials: "include",
    });
    const userInfo = await response.json();
    if (response.ok) {
        return userInfo;
    }
    else {
        throw userInfo; 
    }
}

const API = { 
    getFilmById, getFilteredFilms, addNewFilmLib, 
    updateFilmLib, deleteFilmLib, updateFavInline, 
    updateRateInline, logIn, logOut, getUserInfo 
};
export default API;