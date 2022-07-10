const mongoose = require('mongoose');

const RedditTest = mongoose.model(
  'RedditTest',
  mongoose.Schema({
    title: String,
  })
);

module.exports = RedditTest;
