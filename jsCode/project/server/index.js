'use strict';
// import modules
const dayjs = require('dayjs');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');

// import local modules
const user_dao = require('./user_dao');

// init express
const app = new express();
const port = 3000;

// set-up middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up passport
passport.use ( new LocalStrategy (
  function (username, password, done) {
    user_dao.getUser(username, password)
      .then ( (user) => {
        if (!user) {
          return done (null, false, { message: 'Credentials not correct' });
        }
        return done (null, user);
      } )
      .catch ( (err) => { return done (err); } )
  }
));

passport.serializeUser ( (user, done) => {
  done (null, user.id);
} );

passport.deserializeUser ( (id, done) => {
  user_dao.getUserById(id)
    .then ( (user) => { done (null, user); } )
    .catch ( (err) => { done (err, null); } )
} );

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'not authenticated' });
};

// set-up session
app.use(session({
  secret: 'I love mangos',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// POST: /api/sessions -> login
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE: /api/sessions/current -> logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout ( () => {
    res.end();
  });
});

// GET: /api/sessions/current -> get current user info
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else {
    res.status(401).json({ error: 'Unauthenticated user!' });
  }
});

// activate the server on the port 3000
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});