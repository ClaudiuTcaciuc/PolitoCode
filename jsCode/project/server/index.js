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
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: 'not authenticated or not admin' });
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
app.delete("/api/sessions/current", isLoggedIn, (req, res) => {
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
    const id = parseInt(req.params.id);
    if( isNaN(id) ){
        res.status(400).json({ error: 'Page not found' });
        return;
    }
    const blocks = await dao.getPageContent(id);
    const page = await dao.getPageByID(blocks[0].page_id);

    const result = {  
      page_info: page,
      content: blocks
    };
    conditionalTimeout( () => res.json(result) );
  }
  catch (err){
    res.status(500).json(err);
  }
});

// PUT: api/changeappname -> change app name
app.put("/api/changeappname", isLoggedInAdmin, (req, res) => {
  const updateData = req.body;
  fs.writeFile('./appname.json', JSON.stringify(updateData), (err) => {
    if (err){
      res.status(500).send("Internal server error");
      return;
    }
    res.status(200).send("App name changed");
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

// POST: api/add_page -> add a new page
app.post("/api/add_page", isLoggedIn, [
  check("title").isLength({ min: 1 }),
  check("creation_date").custom( (value) => {
    if (value !== null) {
      const date = dayjs(value).isValid();
      if (!date) {
        throw new Error("Invalid creation date");
      }
    }
    return true;
  }),
  check("blocks").isArray({ min: 2 }).custom( (value) => {
    if (value !== null){
      const hasHeader = value.some( (block) => block.type === 1 && block.content.trim() !== "" );
      const hasParagraph = value.some( (block) => block.type === 2 && block.content.trim() !== "" );
      const hadContent = value.filter ( (block) => block.content.trim() === "" ).length>=1;
      if (!hasHeader || !hasParagraph || hadContent) {
        throw new Error("Invalid blocks");
      }
    }
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  const request_body = req.body;
  const page = {
    title: request_body.title,
    author_id: req.user.id,
    creation_date: request_body.creation_date,
    publication_date: dayjs(request_body.publication_date).isValid() ? dayjs(request_body.publication_date).format("YYYY-MM-DD") : "Draft",
  }

  try {
    const page_id = await dao.insertPage(page);
    if (page_id === -1) {
      res.status(500).json( { error: "Internal server error" } );
      return;
    }
    
    for (const block of request_body.blocks) {
      const new_block = {
        page_id: page_id,
        block_type: block.type,
        content: block.content,
        order_index: block.order_index + 1
      };
      
      try {
        await dao.insertContentBlock(new_block);
      } catch (err) {
        res.status(500).json( { error: "Internal server error" } );
        return;
      }
    }
    res.status(200).json({ id: page_id });
  } catch (err) {
    res.status(500).json( { error: "Internal server error" } );
    return;
  }
});

// PUT: api/edit_page/:id -> edit a page by id


// DELETE: api/page/:id -> delete a page by id and the related content
app.delete('/api/delete_page/:id', isLoggedIn, async (req, res) => {
  const id = parseInt(req.params.id);
  if( isNaN(id) ){
      res.status(400).json({ error: 'Page not found' });
      return;
  }
  const page = await dao.getPageByID(id);
  if(page.err)
    return res.status(404).json(page);
  if(page.author_id !== req.user.id || !req.user.isAdmin)
    return res.status(401).json({ error: 'Unauthorized user' });
  try{
    await dao.deleteContentPage(id);
    await dao.deletePage(id);
    res.status(200).json({ message: 'Page deleted' });
  }
  catch(err){
    res.status(500).json(err);
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
