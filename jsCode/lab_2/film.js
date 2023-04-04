"use strict"
const dayjs = require('dayjs')
const sqlite = require('sqlite3')

const db = new sqlite.Database('films.db', (err)=>{if(err) throw err;})

class film{
    constructor(ID_film, title, favorite, date_watch, rating){
        this.ID_film = ID_film;
        this.title = title;
        this.favorite = favorite;
        this.date_watch = date_watch === null ? null : dayjs(date_watch); 
        this.rating = rating;
    }
    toString(){
        return `ID: ${this.ID_film}, Title: ${this.title}, Favorite: ${this.favorite}, Date Watch: ${this.date_watch === null ? "not watched" : this.date_watch.format("YYYY-MM-DD")}, Rating: ${this.rating}`;
    }
}

class filmLibrary {
    constructor(){
        this.films = [];
    }
    async populateLibrary(){
        return new Promise((resolve, reject)=>{
            db.all('SELECT * FROM films', (err, rows)=>{
                if(err) reject(err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating)));
            })
        })
    }
    printLibrary(){
        this.films.forEach(film => console.log(film.toString()));
    }
    async getFavouriteFilms(){
        return new Promise ((resolve, reject) =>{
            db.all('SELECT * FROM films WHERE favorite = 1', (err, rows)=>{
                if(err) reject (err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating )))
            })
        })
    }
    async getWatchedToday(){
        return new Promise ((resolve, reject) =>{
            db.all('SELECT * FROM films WHERE watchdate = date("now")', (err, rows)=>{
                if(err) reject (err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating )))
            })
        })
    }
    async getWatchedBeforeDate(date){
        return new Promise ((resolve, reject) =>{
            db.all('SELECT * FROM films WHERE watchdate <= date(?)', date, (err, rows)=>{
                if(err) reject (err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating )))
            })
        })
    }
    async getRatedHigherThan(rating){
        return new Promise ((resolve, reject) =>{
            db.all('SELECT * FROM films WHERE rating >= ?', rating, (err, rows)=>{
                if(err) reject (err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating )))
            })
        })
    }
    async getFilmContainingString(string){
        return new Promise ((resolve, reject) =>{
            db.all('SELECT * FROM films WHERE title LIKE ?', string, (err, rows)=>{
                if(err) reject (err);
                resolve(rows.map(row => new film(row.id, row.title, row.favorite, row.watchdate, row.rating )))
            })
        })
    }
    async insertFilm(new_film){
        return new Promise ((resolve) =>{
            db.run('INSERT INTO films (id, title, favorite, watchdate, rating) VALUES (?, ?, ?, ?, ?)', new_film.ID_film, new_film.title, new_film.favorite, new_film.date_watch.format("YYYY-MM-DD"), new_film.rating, (err)=>{
                if(err){
                    console.log(`Error inserting film: ${err}`);
                }
                else{
                    resolve (console.log(`Film ${new_film.title} inserted`), new_film.ID_film);
                }
            })
        })
    }
    async deleteFilm(ID_film){
        return new Promise ((resolve) =>{
            db.run('DELETE FROM films WHERE id = ?', ID_film, (err)=>{
                if(err){
                    console.log(`Error deleting film: ${err}`);
                }
                else{
                    resolve (console.log(`Film ${ID_film} deleted`));
                }
            })
        })
    }
    async deleteWatchDate(){
        return new Promise ((resolve) =>{
            db.run('UPDATE films SET watchdate = NULL', (err)=>{
                if(err){
                    console.log(`Error deleting watchdate: ${err}`);
                }
                else{
                    resolve (console.log(`Watchdate deleted`));
                }
            })
        })
    }
}

async function main(){
    let now = dayjs().format("YYYY-MM-DD");
    let rate = 2;
    let string_to_search = "%rek%";
    let new_film = new film(16, "Star Trek", 1, "2023-03-15", 5);
    let film_library = new filmLibrary();
    let films = await film_library.populateLibrary();
    let fav_films = await film_library.getFavouriteFilms();
    let watched_today = await film_library.getWatchedToday();
    let watched_before = await film_library.getWatchedBeforeDate(now);
    let rated_higher = await film_library.getRatedHigherThan(rate);
    let films_containing_string = await film_library.getFilmContainingString(string_to_search);
    
    console.log("All films: ");
    films.forEach(film => console.log(film.toString()));
    console.log("Favourite films: ");
    fav_films.forEach(film => console.log(film.toString()));
    console.log("Films watched today: ");
    watched_today.forEach(film => console.log(film.toString()));
    console.log(`Films watched before ${now}: `);
    watched_before.forEach(film => console.log(film.toString()));
    console.log(`Films rated higher than ${rate}: `);
    rated_higher.forEach(film => console.log(film.toString()));
    console.log(`Films containing string ${string_to_search}: `);
    films_containing_string.forEach(film => console.log(film.toString()));
    
    await film_library.insertFilm(new_film);
    await film_library.deleteFilm(2);
    await film_library.deleteWatchDate();
}

main().then( ()=>{db.close()})