'use strict';
const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  name: { type: String },
  created: {type: Date, default: Date.now},
  author: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }},
  type: { type: String },
  ethnicity: { type: String },
  servings: { type: Number },
  ingredients: [],
  directions: { type: String, required: true },
  image: {type: String  }
});

recipeSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    name: this.name,
   
  };
};

const Recipe = mongoose.model('Recipes', recipeSchema);

module.exports = { Recipe };