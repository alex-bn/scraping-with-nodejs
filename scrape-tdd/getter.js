const request = require('request-promise');
const fs = require('fs');
const config = require('./config');
const puppeteer = require('puppeteer');

const proxy = `http://api.scraperapi.com?api_key=${config.scrapeAPIKey}&url=`;
const url = 'https://sfbay.craigslist.org/d/musicians/search/muc';
const pageUrl = proxy + url;

// # option 1 - JavaScript is not enabled
async function getHtmlWithRequest(url) {
  return await request.get(url);
}

// # option 2 - JavaScript is enabled
async function getHtmlWithPuppeteer(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  // await sleep(1500);
  const html = await page.content();
  await browser.close();
  return html;
}

// # save html to disk
function saveHtmlToFile(html) {
  fs.writeFileSync('./test.html', html);
}

// # just in case
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// # press the button
async function main() {
  saveHtmlToFile(await getHtmlWithPuppeteer(pageUrl));
}
main();
