const mongoose = require('mongoose');
const cheerio = require('cheerio');
const request = require('request-promise');
const RedditTest = require('./RedditTest');

const uri =
  'mongodb+srv://reddit:reddit@cluster0.bcje2.mongodb.net/?retryWrites=true&w=majority';

function mongoConnect() {
  mongoose.connect(uri, err =>
    err ? console.log(err) : console.log('Connected to database')
  );
}

async function redditScraper() {
  const html = await request.get('https://www.reddit.com');
  const $ = cheerio.load(html);

  const titles = $('a > div > h3');

  titles.each(async (index, element) => {
    const title = $(element).text();
    console.log(title);
    const redditTest = new RedditTest({
      title: title,
    });
    await redditTest.save();
  });
}

async function main() {
  mongoConnect();
  redditScraper();
}

main();
