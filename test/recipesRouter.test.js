'use strict';
const {app} = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL} = require('../config');

const  Recipe  = require('../models/recipesModel');

const seedRecipes = require('../db/seed/recipes');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Share Your Yummies - Recipes', function () {

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL);
  });
  beforeEach(function () {
    return Recipe.insertMany(seedRecipes);
    //   .then(() => Recipe.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET/api/recipes', function () {

    it('should return the correct number of Recipes and correct fields', function () {
      const dbPromise = Recipe.find();
      const apiPromise = chai.request(app).get('/recipes');

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('name', 'author','created', 'type', 'ethnicity', 'id', 'servings', 'ingredients', 'directions', 'downloadUrl' );
          });
        });
    
    });

    it('should return an empty array for an incorrect query', function () {
      const searchTerm = 'NotValid';
      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Recipe.find({name: { $regex: re } });
      const apiPromise = chai.request(app).get(`/recipes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

  });

  describe('POST /api/recipes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'name': 'Carrot Cake',
        'author': 'Samantha',
        'type': 'dessert',
        'ethnicity': 'American',
        'servings': 8,
        'ingredients': [
          'flour',
          'carrot',
          'milk',
          'baking powder'
        ],
        'directions': 'Lorem Ipsum',
        'downloadUrl': 'http://'
      };
      let res;
      return chai.request(app)
        .post('/recipes')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', './userimages/default.jpg')
        .field('name', 'Carrot Cake')
        .field('author', 'Samantha')
        .field('type', 'dessert')
        .field('ethnicity', 'American')
        .field('servings', 8)
        .field('ingredients', 'carrot')
        .field('ingredients', 'flour')
        .field('ingredients', 'milk')
        .field('ingredients', 'baking powder')
        .field('directions', 'Lorem Ipsum')
        .field('downloadUrl', 'http://')    
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('name', 'author', 'created', 'type', 'ethnicity', 'id', 'servings', 'ingredients', 'directions', 'downloadUrl');
          return Recipe.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
          expect(res.body.author).to.equal(data.author);
          expect(res.body.type).to.equal(data.type);
          expect(res.body.ethnicity).to.equal(data.ethnicity);
          expect(res.body.servings).to.equal(data.servings);
          expect(res.body.ingredients.length).to.equal(data.ingredients.length);
          expect(res.body.directions).to.equal(data.directions);
          expect(res.body.downloadUrl).to.equal(data.downloadUrl);
        });
    });
    
    it('should return an error when posting an object with a missing "title" field', function () {
      const newItem = {
        
        'author': 'Samantha',
        'type': 'dessert',
        'ethnicity': 'American',
        'servings': 8,
        'ingredients': [
          'flour',
          'carrot',
          'milk',
          'baking powder'
        ],
        'directions': 'Lorem Ipsum',
        'downloadUrl': 'http://'
      };

      return chai.request(app)
        .post('/recipes')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing field');
        });
    });
  });
  describe('DELETE  /api/recipes/:id', function () {

    it('should delete an item by id', function () {
      let data;
      return Recipe.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/recipes/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

  });
});