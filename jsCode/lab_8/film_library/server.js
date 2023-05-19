"use strict";
const dayjs = require("dayjs"); 
const express = require("express");
const morgan = require("morgan");
const { check, validationResult } = require("express-validator");
const dao = require("./dao.js");

// init express
const app = express();
const port = 3000;

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json());

// GET /api/films
app.get("/api/films", (req, res) => {
    dao.getRetriveFilms()
        .then(films => res.json(films))
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/:id
app.get("/api/film/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id." });
            return;
        }
        else{
            dao.getRetriveFilmId(id)
                .then(film => res.json(film))
                .catch((err) => res.status(500).json(err));
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// GET /api/films/favorite
app.get("/api/films/favorites", (req, res) => {
    dao.getFilmsFavorite()
        .then(films => res.json(films))
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/bestrated
app.get("/api/films/bestrated", (req, res) => {
    dao.getFilmsBestRated()
        .then(films => res.json(films))
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/seenlastmonth
app.get("/api/films/seenlastmonth", (req, res) => {
    dao.getFilmsSeenLastMonth()
        .then(films => res.json(films))
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/unseen
app.get("/api/films/unseen", (req, res) => {
    dao.getFilmsUnseen()
        .then(films => res.json(films))
        .catch((err) => res.status(500).json(err));
});

// GET /api/lastid
app.get("/api/lastid", (req, res) => {
    dao.getRetriveLastID()
        .then(id => res.json(id))
        .catch((err) => res.status(500).json(err));
});

// POST /api/addafilm
app.post("/api/addfilm", [
    check("title").isLength({ min: 1 }),
    check("favorite").isBoolean(),
    check("watchdate").custom((value) => {
        if (value !== null) {
            const isValidDate = dayjs(value, "YYYY-MM-DD").isValid();
            if (!isValidDate) {
                throw new Error("Invalid date, please use format YYYY-MM-DD or leave it empty");
            }
        }
        return true;
    }),
    check("rating").custom((value) => {
        if (value !== null) {
            if (value < 1 || value > 5) {
                throw new Error("Invalid rating, please use a number between 1 and 5 or leave it empty");
            }
        }
        return true;
    })
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }
    const lastID = await dao.getRetriveLastID();
    // create a new film
    const film = {
        ID_film: lastID + 1,
        title: req.body.title,
        favorite: req.body.favorite,
        watchdate: req.body.watchdate,
        rating: req.body.rating,
        user: req.body.user
    };
    console.log(film);
    try {
        const filmID = await dao.createFilm(film);
        res.status(201).json(filmID);
    }catch(err) {
        res.status(503).json({ error: `Database error during the creation of film ${film.title} with ID ${film.ID_film}.` });
    }
});

// PUT /api/films/:id
app.put("/api/updatefilm/:id", [
    check("title").isLength({ min: 1 }),
    check("favorite").isBoolean(),
    check("watchdate").custom((value) => {
        if (value !== null) {
            const isValidDate = dayjs(value, "YYYY-MM-DD").isValid();
            if (!isValidDate) {
                throw new Error("Invalid date, please use format YYYY-MM-DD or leave it empty");
            }
        }
        return true;
    }),
    check("rating").custom((value) => {
        if (value !== null) {
            if (value < 1 || value > 5) {
                throw new Error("Invalid rating, please use a number between 1 and 5 or leave it empty");
            }
        }
        return true;
    })
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }
 
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id);
    if (filmToUpdate.error) 
        return res.status(404).json(filmToUpdate);
    else {
        const film = {
            id: req.params.id,
            title: req.body.title,
            favorite: req.body.favorite,
            watchdate: req.body.watchdate,
            rating: req.body.rating,
            user: req.body.user
        };
        try {
            const update_film = await dao.updateFilm(film);
            res.json(update_film)
            res.status(200).end();
        }catch(err) {
            res.status(503).json({ error: `Database error during the update of film ${film.title} with ID ${film.ID_film}.` });
        }
    }
});

// DELETE /api/deletefilm/:id
app.delete("/api/deletefilm/:id", async(req, res) => {
    const filmToDelete = await dao.getRetriveFilmId(req.params.id);
    if (filmToDelete.error) 
        return res.status(404).json(filmToDelete);
    else {
        try {
            const delete_film = await dao.deleteFilm(req.params.id);
            res.json(delete_film)
            res.status(200).end();
        }catch(err) {
            res.status(503).json({ error: `Database error during the delete of film ${filmToDelete.title} with ID ${filmToDelete.ID_film}.` });
        }
    }
});

// PUT /api/setfavorite/:id
app.put("/api/setfavorite/:id", [
    check("favorite").isBoolean()
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id);
    if (filmToUpdate.error) 
        return res.status(404).json(filmToUpdate);
    else {
        try {
            const set_favorite = await dao.setFavoriteFilm(req.params.id, req.body.favorite);
            res.json(set_favorite)
            res.status(200).end();
        }catch(err) {
            res.status(503).json({ error: `Database error during the update of film ${filmToUpdate.title} with ID ${filmToUpdate.ID_film}.` });
        }
    }
});

// PUT /api/updaterating/:id
app.put("/api/updaterating/:id", [
    check("rating").custom((value) => {
        if (value !== null) {
            if (value < 1 || value > 5) {
                throw new Error("Invalid rating, please use a number between 1 and 5 or leave it empty");
            }
        }
        return true;
    })
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id);
    if (filmToUpdate.error)
        return res.status(404).json(filmToUpdate);
    else {
        try {
            const update_rating = await dao.updateRatingFilm(req.params.id, req.body.rating);
            res.json(update_rating)
            res.status(200).end();
        }catch(err) {
            res.status(503).json({ error: `Database error during the update of film ${filmToUpdate.title} with ID ${filmToUpdate.ID_film}.` });
        }
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));