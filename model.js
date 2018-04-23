'use strict';
const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  name: { type: String },
  author: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }},
  type: { type: String },
  ethnicity: { type: String },
  servings: { type: Number },
  ingredients: [],
  directions: { type: String, required: true },
  image: { data: Buffer, contentType: String  }
});

recipeSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    name: this.name,
    summary: this.summary
  };
};

const Recipe = mongoose.model('Recipes', recipeSchema);

module.exports = { Recipe };