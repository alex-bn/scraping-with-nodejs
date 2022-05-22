const request = require('request-promise');
const cheerio = require('cheerio');
const config = require('../config');
const puppeteer = require('puppeteer');

const proxy = `http://api.scraperapi.com/?api_key=${config.scrapeAPIKey}&url=`;
const testUrl = 'https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof';
const url = proxy + testUrl;

// desired sample scrape-result
const scrapeSample = {
  title: 'jobTitle',
  description: 'jobDescription',
  datePosted: new Date(),
  url: 'url',
  hood: 'neighborhood',
  address: 'jobAddress',
  compensation: 'salary',
};

const scrapeResults = [];

async function scrapeJobHeader() {
  try {
    const htmlResult = await request.get(url);
    const $ = cheerio.load(htmlResult);

    $('.result-info').each((index, element) => {
      const resultTitle = $(element).find('.result-title');

      const title = resultTitle.text();
      const url = resultTitle.attr('href');
      const datePosted = new Date($(element).children('time').attr('datetime'));
      const hood = $(element)
        .find('.result-hood')
        .text()
        .trim()
        .replace(/\W/g, '');

      const result = { title, url, datePosted, hood };
      scrapeResults.push(result);
    });

    console.log('pages to iterate: ', scrapeResults.length);
    return scrapeResults;
  } catch (error) {
    console.log(error);
  }
}

const newList = [];

// proxy limitation - need to change this and use pptr I guess
async function scrapeDescription(jobsHeader) {
  try {
    // return await Promise.all([
    //   jobsHeader.map(async job => {
    //     const htmlResult = await request.get(proxy + job.url);
    //     const $ = cheerio.load(htmlResult);

    //     $('.print-qrcode-container').remove();
    //     job.description = $('#postingbody').text();
    //     job.address = $('div.mapaddress').text();
    //     job.compensation = $('.attrgroup')
    //       .children()
    //       .first()
    //       .text()
    //       .replace('compensation: ', '');
    //     return job;
    //   }),
    // ]);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (let i = 0; i < 3; i++) {
      await sleep(1000);

      await page.goto(proxy + jobsHeader[i].url);
      const htmlResult = await page.content();
      const $ = cheerio.load(htmlResult);

      $('.print-qrcode-container').remove();
      jobsHeader[i].description = $('#postingbody').text();
      jobsHeader[i].address = $('div.mapaddress').text();
      jobsHeader[i].compensation = $('.attrgroup')
        .children()
        .first()
        .text()
        .replace('compensation: ', '');

      newList.push(jobsHeader[i]);
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrape() {
  const jobsHeader = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsHeader);
  // console.log(jobsFullData);
  console.log(newList);
}

scrape();
