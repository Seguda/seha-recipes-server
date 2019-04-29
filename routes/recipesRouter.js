'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Recipe  = require('../models/recipesModel');


router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  let filter = {};
  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.name = { $regex: re };
  }
  Recipe
    .find(filter)
    .sort('created')
    .exec()
    .then(results => {
      res.json(results);

    })
    .catch(err => next(err));

});


router.post('/', jsonParser, (req, res) => {
  const { name, author, type, ethnicity, servings, ingredients, directions} = req.body;
  // console.log(req.body);
  const requiredFields = ['name', 'author', 'type', 'ethnicity', 'servings', 'ingredients', 'directions'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  //let { name, author, type, ethnicity, servings, ingredients, directions } = req.body;

  var downloadUrl = `static/${req.files.file.name}`;
  var imageUrl = `images/${req.files.file.name}`;
  
  var file = req.files.file;
 
  file.mv(imageUrl, function (err) {
    console.log(err);
  });

  const newItem = { downloadUrl, name, author, type, ethnicity, servings, ingredients, directions};
 
  return Recipe.create(newItem) 
    .then((results) => {
      return res.status(201).json(results);
    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json(err);
    });
});

router.post('/upload', function (req, res) {
  if (!req.files) {
    console.log('No files were uploaded.');
    return res.status(400).send('No files were uploaded.');
  }

  var sampleFile = req.files.file;

  sampleFile.mv('images/userimages/file.png', function (err) {
    console.log('File uploaded.');
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  Recipe.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;