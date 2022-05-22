const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  datePosted: Date,
  neighborhood: String,
  url: String,
  jobDescription: String,
  compensation: String,
});

module.exports = mongoose.model('Listing', listingSchema);
