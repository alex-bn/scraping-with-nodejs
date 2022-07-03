const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const config = require('../config');

const proxy = `http://api.scraperapi.com/?api_key=${config.scrapeAPIKey}&url=`;
const loginUrl = 'https://accounts.craigslist.org/login';
const url = proxy + loginUrl;

async function main() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    await page.type('input#inputEmailHandle', '@gmail.com', {
      delay: 0,
    });
    await page.type('input#inputPassword', 'Fn&ET2Br45!z');

    const [response] = await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
      page.click('button#login'), // Clicking the link will indirectly cause a navigation
    ]);

    const content = await page.content();
    const $ = await cheerio.load(content);

    $('selector').text();
  } catch (error) {
    console.log(error);
  }
}

main();
