'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');
const morgan = require('morgan');
const { Recipe } = require('./model');
//const {recipes} =require('./recipes');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/recipes', (req, res) => {
  Recipe.find()
    .then(recipes => {
      res.json(recipes);
      //recipes:recipes
      //recipes: recipes.map( recipe => recipe.apiRepr())
    
    })  
    .catch(err =>{
      console.log(err);
      return res.status(500).json({ message: 'Internal server error'});
    });
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
