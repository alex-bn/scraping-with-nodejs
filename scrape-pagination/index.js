const request = require('request-promise');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let index = 1; index <= 5; index++) {
    //
    const html = await request.get(
      `https://books.toscrape.com/catalogue/page-${index}.html`
    );

    //
    await page.goto(`https://books.toscrape.com/catalogue/page-${index}.html`);
    const html2 = await page.content();

    // fs.writeFileSync('./req.txt', html);
    // fs.writeFileSync('pup.txt', html2);

    const $ = cheerio.load(html2);
    $('h3 > a').each((index, element) => console.log($(element).text()));
    console.log('At page number: ' + index);
  }

  await browser.close();
}
scrape();
