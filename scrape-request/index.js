const request = require('request-promise');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
const config = require('../config');

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

const headerResults = [];
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
      headerResults.push(result);
    });

    console.log('Results: ', headerResults.length, '/120');
    return headerResults;
  } catch (error) {
    console.log(error);
  }
}

// pptr will loop through all urls
const descriptionResultsPuppeteer = [];
async function scrapeDescriptionWithPuppeteer(headerResults) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // loop # elements
    for (let i = 0; i < 5; i++) {
      await sleep(1000);
      await page.goto(proxy + headerResults[i].url);
      const htmlResult = await page.content();
      const $ = cheerio.load(htmlResult);

      $('.print-qrcode-container').remove();
      headerResults[i].description = $('#postingbody')
        .text()
        .replace(/\r?\n|\r/g, '');
      headerResults[i].address = $('div.mapaddress').text();
      headerResults[i].compensation = $('.attrgroup')
        .children()
        .first()
        .text()
        .replace('compensation: ', '');

      descriptionResultsPuppeteer.push(headerResults[i]);
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

async function scrapeDescriptionWithRequest(headerResults) {
  try {
    // Problem: proxy cannot handle this many concurrent requests
    // return await Promise.all([
    //   headerResults.map(async result => {
    //     const htmlResult = await request.get(proxy + result.url);
    //     const $ = cheerio.load(htmlResult);
    //     $('.print-qrcode-container').remove();
    //     result.description = $('#postingbody').text();
    //     result.address = $('div.mapaddress').text();
    //     result.compensation = $('.attrgroup')
    //       .children()
    //       .first()
    //       .text()
    //       .replace('compensation: ', '');
    //     return result;
    //   }),
    // ]);

    // loop # elements
    for (let i = 0; i < 10; i++) {
      let job = headerResults[i];
      const html = await request.get(proxy + job.url);
      console.log('job', i);

      const $ = await cheerio.load(html);
      $('.print-qrcode-container').remove();
      job.description = $('#postingbody')
        .text()
        .replace(/\r?\n|\r/g, '');
      job.address = $('div.mapaddress').text();
      job.compensation = $('.attrgroup')
        .children()
        .first()
        .text()
        .replace('compensation: ', '');

      // console.log(job);
    }
    return headerResults;
  } catch (error) {
    console.log(error);
  }
}

// # to avoid getting banned
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// fix the scraper first
async function createCsvFile(data) {
  const csv = new ObjectsToCsv(data);
  // Save to file:
  await csv.toDisk('./test.csv');
  // Return the CSV file as string:
  console.log(await csv.toString());
}

// main
async function main() {
  // step 1
  const jobsHeader = await scrapeJobHeader();
  // console.log(jobsHeader);

  // // step 2
  // const fullDataWithPuppeteer = await scrapeDescriptionWithPuppeteer(
  //   jobsHeader
  // );
  // // console.log(descriptionResultsPuppeteer);

  // alternative step
  const fullDataWithRequest = await scrapeDescriptionWithRequest(jobsHeader);
  // console.log(headerResults);
}

main();
