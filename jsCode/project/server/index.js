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
const fs = require('fs');

// import local modules
const user_dao = require('./user_dao');
const dao = require('./dao');
// init express
const app = new express();
const port = 3000;

// set-up middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up passport
passport.use ( new LocalStrategy ( {
  // credentials are email and password 
    usernameField: 'email',
    passwordField: 'password'
},
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

// check if the user is logged in and is an admin
const isLoggedInAdmin = (req, res, next) => {
  user_dao.getUserById(req.user.id).then((user) => {
    if (user && user.isAdmin === 1) {
      return next();
    }
  }).catch((err) => {
    return err.status(401).json({ error: 'not an admin' });
  });
  
};

// set-up session
app.use(session({
  secret: 'I love mangos',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// set timeout for requests to simulate remote server delay
const enableTimeout = false;
const timeout = 0.1 * 1000; // 10 seconds

function conditionalTimeout ( functor ){
    if (enableTimeout)
        setTimeout(functor, timeout);
    else
        functor();
}

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


// GET: api/publicpages -> get all public pages to show in home page
app.get("/api/publicpages", (req, res) => {
  dao.getPubPages()
    .then( (pages) => {
      conditionalTimeout( () => res.json(pages) );
    } )
    .catch( (err) => res.status(500).json( err ) );
});

// GET: api/allpages -> get all pages to show in home for logged users 
app.get("/api/allpages", isLoggedIn, (req, res) => {
  dao.getPages()
    .then( (pages) => {
      conditionalTimeout( () => res.json(pages) );
    } )
    .catch( (err) => res.status(500).json( err ) );
});

// GET: api/page/:id -> get page content by id
app.get("/api/page/:id", async (req, res) => {
  try{
    console.log(req.params.id);
    const id = parseInt(req.params.id);
    if( isNaN(id) ){
      res.status(400).json({ error: 'Page not found' });
      return;
    }
    const blocks = await dao.getPageContent(id);
    const page = await dao.getPageByID(blocks[0].page_id);

    const result = {  
      page: page,
      content: blocks
    };
    conditionalTimeout( () => res.json(result) );
  }
  catch (err){
    res.status(500).json(err);
  }
});

// PUT: api/changeappname -> change app name
app.put("/api/changeappname", isLoggedIn, (req, res) => {
  if (!isLoggedInAdmin){
    res.status(401).send("Unauthorized");
    return;
  }
  const updateData = req.body;
  fs.readFile('./appname.json', 'utf8', (err, data) => {
    if (err){
      res.status(500).send("Internal server error");
      return;
    }
    let data_json;
    try {
      data_json = JSON.parse(data);
    }
    catch (err) {
      res.status(500).send("Internal server error");
      return;
    }
    const updateJSON = {... data_json, ...updateData};
    fs.writeFile('./appname.json', JSON.stringify(updateJSON), (err) => {
      if (err){
        res.status(500).send("Internal server error");
        return;
      }
      res.status(200).send("App name changed");
    });
  });
});

// GET: api/appname -> get app name
app.get("/api/appname", (req, res) => {
  fs.readFile('./appname.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send("Internal server error");
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData.application_name);
    } catch (err) {
      res.status(501).send("Internal server error");
      return;
    }
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});