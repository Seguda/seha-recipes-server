'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

mongoose.Promise = global.Promise;

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const { recipesRouter } = require('./routes');


const app = express();
app.use(bodyParser.json());

app.get('/heartbeat', function (req, res) {
  res.json({
    is: 'working'
  });
});

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(fileUpload());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/recipes', recipesRouter);
app.use('/static', express.static('userimages'));

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  let promise = new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.info(`App listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
          // console.error('Express failed to start');
          // console.error(err);
        });
    });
  });
  return promise;
}

function closeServer() {
  return mongoose.disconnect()
    .then(() => {
      let promise = new Promise((resolve, reject) => {
        console.log('Closing server...');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
      return promise;
    });
}

if (require.main === module) {
  runServer()
    .catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };