const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('./config');
const mongoose = require('mongoose');
const Listing = require('./model/Listing');
const fs = require('fs');

// Problem: access url and save infoes using the following structure:
const results = [
  {
    title: 'jobTitle',
    datePosted: 'datePosted',
    neighborhood: 'neighborhood',
    url: 'url',
    jobDescription: 'description',
    compensation: 'compensation',
  },
];
// Problem: save to a db

async function mongoConnect() {
  await mongoose.connect(config.mongoUri);
  console.log('connected to mongodb');
}
async function mongoDisconnect() {
  await mongoose.disconnect();
  console.log('disconnected from mongoo');
}

// website is going to block me, so:
const proxy = `http://api.scraperapi.com?api_key=${config.scrapeAPIKey}&url=`;
const url = 'https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof';
const pageUrl = proxy + url;

async function scrapeListings(page) {
  await page.goto(pageUrl);

  const html = await page.content(); // get html
  const $ = cheerio.load(html);

  const results = $('.result-info')
    .map((index, element) => {
      const titleElement = $(element).find('.result-title');
      const timeElement = $(element).find('.result-date');
      const hoodElement = $(element).find('.result-hood');
      const title = $(titleElement).text();
      const url = $(titleElement).attr('href');
      const datePosted = new Date($(timeElement).attr('datetime'));
      const neighborhood = $(hoodElement).text().trim('').replace(/\W/g, ''); // \W stands for non-word characters

      return { title, url, datePosted, neighborhood };
    })
    .get(); // when using map() with cheerio you need to add .get() at the end of the method!
  return results;
}

async function scrapeJobDescriptions(listings, page) {
  // remember that forEach does things concurrently and puppeteer does not handle that too well,
  for (let i = 0; i < listings.length; i++) {
    await sleep(1000);

    await page.goto(proxy + listings[i].url);
    const html = await page.content();
    const $ = cheerio.load(html);

    const description = $('#postingbody').text().trim();
    const compensation = $('p.attrgroup span:nth-child(1) > b').text().trim();
    listings[i].jobDescription = description;
    listings[i].compensation = compensation;

    const listingModel = new Listing(listings[i]);
    await listingModel.save();

    // console.log(listings[i].compensation);
    // console.log(listings[i].jobDescription);
    // fs.appendFileSync('./listings.json', JSON.stringify(listings[i]));
  }
}

// just to make sure that we're not getting blocked again
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await mongoConnect();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);

  const listingsWithJobDescriptions = await scrapeJobDescriptions(
    listings,
    page
  );

  // console.log(listings);
  // fs.appendFileSync('./listings.txt', JSON.stringify(listings));
  await browser.close();
  await mongoDisconnect();
}

main();
