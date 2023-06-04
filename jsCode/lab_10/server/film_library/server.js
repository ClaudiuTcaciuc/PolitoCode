"use strict";
const dayjs = require("dayjs"); 
const express = require("express");
const morgan = require("morgan");
const { check, validationResult } = require("express-validator");
const dao = require("./dao.js");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const user_dao = require("./user_dao.js");

// init express
const app = express();
const port = 3000;

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

// set timeout
const enableTimeout = true;
const timeout = 0.1 * 1000; // 10 seconds

function conditionalTimeout ( functor ){
    if (enableTimeout)
        setTimeout(functor, timeout);
    else
        functor();
}

// set passport
passport.use (new LocalStrategy (
    function (username, password, done) {
        user_dao.getUser(username, password)
            .then ( (user) => {
                if (!user)
                    return done (null, false, { message: "Incorrect username and/or password." });
                return done (null, user);
            } )
            .catch ( (err) => { return done (err); } );
    }
))

passport.serializeUser ( (user, done) => {
    done (null, user.id);
} );

passport.deserializeUser ( (id, done) => {
    user_dao.getUserById (id)
        .then ( (user) => { done (null, user); } )
        .catch ( (err) => { done (err, null); } );
} );

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    return res.status(401).json({ error: "Not authenticated." });
};

app.use (session({
    secret: "I love mangos",
    resave: false,
    saveUninitialized: false
}));

app.use (passport.initialize());
app.use (passport.session());

// GET /api/films
app.get("/api/films", isLoggedIn, (req, res) => {
    dao.getRetriveFilms(req.user.id)
        .then(
            (films) => conditionalTimeout( () => res.json(films) )
        )
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/:id
app.get("/api/film/:id", isLoggedIn, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id." });
            return;
        }
        else{
            dao.getRetriveFilmId(id, req.user.id)
                .then(
                    (film) => conditionalTimeout( () => res.json(film) )
                )
                .catch((err) => res.status(500).json(err));
        }
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
});

// GET /api/films/favorite
app.get("/api/films/favorites", isLoggedIn, (req, res) => {
    dao.getFilmsFavorite(req.user.id)
        .then(
            (films) => conditionalTimeout( () => res.json(films) )
        )
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/bestrated
app.get("/api/films/bestrated", isLoggedIn, (req, res) => {
    dao.getFilmsBestRated(req.user.id)
        .then(
            (films) => conditionalTimeout( () => res.json(films) )
        )
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/seenlastmonth
app.get("/api/films/seenlastmonth", isLoggedIn, (req, res) => {
    dao.getFilmsSeenLastMonth(req.user.id)
        .then(
            (films) => conditionalTimeout( () => res.json(films) )
        )
        .catch((err) => res.status(500).json(err));
});

// GET /api/films/unseen
app.get("/api/films/unseen", isLoggedIn, (req, res) => {
    dao.getFilmsUnseen(req.user.id)
        .then(
            (films) => conditionalTimeout( () => res.json(films) )
        )
        .catch((err) => res.status(500).json(err));
});

// GET /api/lastid
app.get("/api/lastid", isLoggedIn, (req, res) => {
    dao.getRetriveLastID(req.user.id)
        .then(
            (id) => conditionalTimeout( () => res.json(id) )
        )
        .catch((err) => res.status(500).json(err));
});

// POST /api/addafilm
app.post("/api/addfilm", isLoggedIn, [
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
        user: req.user.id
    };
    try {
        const filmID = await dao.createFilm(film);
        res.status(201).json(filmID);
    }catch(err) {
        res.status(503).json({ error: `Database error during the creation of film ${film.title} with ID ${film.ID_film}.` });
    }
});

// PUT /api/films/:id
app.put("/api/updatefilm/:id", isLoggedIn, [
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
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id, req.user.id);
    if (filmToUpdate.error)
        return res.status(404).json(filmToUpdate);
    else {
        const film = {
            id: req.params.id,
            title: req.body.title,
            favorite: req.body.favorite,
            watchdate: req.body.watchdate,
            rating: req.body.rating,
            user: req.user.id
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
app.delete("/api/deletefilm/:id", isLoggedIn, async(req, res) => {
    const filmToDelete = await dao.getRetriveFilmId(req.params.id);
    if (filmToDelete.error) 
        return res.status(404).json(filmToDelete);
    else {
        try {
            const delete_film = await dao.deleteFilm(req.params.id, req.user.id);
            res.json(delete_film)
            res.status(200).end();
        }catch(err) {
            res.status(503).json({ error: `Database error during the delete of film ${filmToDelete.title} with ID ${filmToDelete.ID_film}.` });
        }
    }
});

// PUT /api/setfavorite/:id
app.put("/api/setfavorite/:id", isLoggedIn, [
    check("favorite").isBoolean()
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }
    console.log(req.params);
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id, req.user.id);
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
app.put("/api/updaterating/:id", isLoggedIn, [
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
    const filmToUpdate = await dao.getRetriveFilmId(req.params.id, req.user.id);
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

app.post("/api/sessions", function (req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).json(info);
        }
        req.login(user, (err) => {
            if (err)
                return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

app.delete("/api/sessions/current", (req, res) => {
    req.logout( () => {
        res.end();
    });
});

app.get("/api/sessions/current", (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else {
        res.status(401).json({ error: "Unauthenticated user!" });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));