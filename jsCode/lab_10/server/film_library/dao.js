"use strict";

const sqlite = require("sqlite3");
const dayjs = require("dayjs");


// open the database
const db = new sqlite.Database("films.db", (err) => {
    if (err) throw err;
});

exports.getRetriveLastID = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT MAX(id) AS maxID FROM films", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.maxID);
        });
    });
};

exports.getRetriveFilms = (user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE user = ?", [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const films = rows.map(
                (e) => ({
                    id: e.id,
                    title: e.title,
                    favorite: e.favorite,
                    watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                    rating: e.rating === null ? "Not rated" : e.rating
                })
            )
            resolve(films);
        })
    })
};

exports.getRetriveFilmId = (id, user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE id = ? AND user = ?", [id, user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows === undefined || rows.length === 0) {
                resolve({ error: "Film not found." });
            }
            else {
                const film = rows.map(
                    (e) => ({
                        id: e.id,
                        title: e.title,
                        favorite: e.favorite,
                        watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                        rating: e.rating === null ? "Not rated" : e.rating
                    })
                )
                resolve(film);
            }
        })
    });
};

exports.getFilmsFavorite = (user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE favorite = 1 AND user = ?", [user],(err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const films = rows.map(
                (e) => ({
                    id: e.id,
                    title: e.title,
                    favorite: e.favorite,
                    watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                    rating: e.rating === null ? "Not rated" : e.rating
                })
            )
            resolve(films);
        })
    })
};

exports.getFilmsBestRated = (user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE rating = 5 AND user = ?", [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const films = rows.map(
                (e) => ({
                    id: e.id,
                    title: e.title,
                    favorite: e.favorite,
                    watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                    rating: e.rating === null ? "Not rated" : e.rating
                })
            )
            resolve(films);
        })
    })
};

exports.getFilmsSeenLastMonth = (user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE watchdate BETWEEN date('2023-04-01', '-1 month') AND date('2023-04-01') AND user = ?", [user], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            const films = rows.map(
                (e) => ({
                    id: e.id,
                    title: e.title,
                    favorite: e.favorite,
                    watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                    rating: e.rating === null ? "Not rated" : e.rating
                })
            )
            resolve(films);
        })
    })
};

exports.getFilmsUnseen = (user) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM films WHERE watchdate IS NULL AND user = ?", [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const films = rows.map(
                (e) => ({
                    id: e.id,
                    title: e.title,
                    favorite: e.favorite,
                    watchdate: e.watchdate === null ? "Not watched" : dayjs(e.watchdate).format("YYYY-MM-DD"),
                    rating: e.rating === null ? "Not rated" : e.rating
                })
            )
            resolve(films);
        })
    })
};

exports.createFilm = (new_film) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO films (id, title, favorite, watchdate, rating, user) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(sql, [
            new_film.ID_film,
            new_film.title,
            new_film.favorite,
            new_film.watchdate,
            new_film.rating,
            new_film.user
        ],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
    });
};

exports.updateFilm = (film) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE films SET title = ?, favorite = ?, watchdate = ?, rating = ?, user = ? WHERE id = ?';
        db.run(sql, [
            film.title,
            film.favorite,
            film.watchdate,
            film.rating,
            film.user,
            film.id
        ],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            });
    });
};

exports.deleteFilm = (id, user) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM films WHERE id = ? AND user = ?';
        db.run(sql, [id, user], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

exports.setFavoriteFilm = (id, fav) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE films SET favorite = ? WHERE id = ?';
        db.run(sql, [fav, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

exports.updateRatingFilm = (id, rating) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE films SET rating = ? WHERE id = ?';
        db.run(sql, [rating, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
}
