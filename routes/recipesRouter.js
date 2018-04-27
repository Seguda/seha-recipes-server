'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { Recipe } = require('./../models');


router.get('/', (req, res, next) => {
  const{ searchTerm } = req.query;
  let filter={};
  if(searchTerm) {
    const re = new RegExp(searchTerm, 'e');
    filter.name = { $regex: re };
  }
  Recipe
    .find(filter)
    .sort('created')
    .exec()
    .then(recipes => {
      res.json(recipes);
   
    })
    .catch(err=> next(err));
    
});
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['name', 'author', 'type', 'ethnicity', 'servings','ingredients', 'directions'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  let { name, author, type, ethnicity, servings, ingredients, directions, image } = req.body;

  return Recipe.create({
    name,
    author,
    type,
    ethnicity,
    servings,
    ingredients,
    directions,
    image
  })
    .then((recipe) => {
      return res.status(201).json(recipe);
    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json(err);
    });
});
module.exports = { router };