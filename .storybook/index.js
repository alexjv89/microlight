// read all the stories.js files
// load it in the memory
// serve them on ]

// always run this from the main repo folder. Not from .storybook folder



const axios = require('axios');
const async = require('async');

const express = require('express');
const port = 4085;
app = express();


require('./bootstrap'); // bootstraps the basics;

// -------------------- Loads all controllers --------------------
const MainController = require('./controllers/MainController');

// --------------------        Done        --------------------

// --------------------    Setup routes.   --------------------
app.get('/', MainController.viewPage);
app.get('/embed', MainController.embedComponent);
app.use(express.static('.storybook/assets')); // loads all the assets from /assets folder

// --------------------        Done        --------------------

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})