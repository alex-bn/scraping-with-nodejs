const async = require('async');
const Nightmare = require('nightmare');
//const nightmare = Nightmare({ show: false });
const request = require('request-promise');
const regularRequest = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  const result = await request.get(
    'https://www.imdb.com/chart/moviemeter?ref_=nv_mv_mpm'
  );
  const $ = await cheerio.load(result);

  const scrapingResults = [];

  $('table > tbody > tr').each((i, element) => {
    const url =
      'https://www.imdb.com' +
      $(element).find('td.titleColumn > a').attr('href');

    const title = $(element).find('td.titleColumn > a').text();

    const rating = $(element).find('.imdbRating').text().trim();

    const rank = $(element).find("[name='rk']").attr('data-value');

    const scrapingResult = {
      title,
      rating,
      rank,
      url,
    };
    scrapingResults.push(scrapingResult);
  });

  return scrapingResults;
}

async function scrapeMediaviewer(url) {
  const result = await request.get(url);
  const $ = await cheerio.load(result);
  return $('.bmkYoJ > div > a').attr('href');
}

async function getPosterUrl(scrapingResult) {
  const nightmare = new Nightmare({ show: true });
  await nightmare.goto(scrapingResult.mediaviewerUrl);
  const html = await nightmare.evaluate(() => document.body.innerHTML);

  const $ = await cheerio.load(html);

  const imageUrl = $(
    '#__next > main > div.ipc-page-content-container.ipc-page-content-container--full.sc-b1984961-0.kXDasd > div.sc-92eff7c6-1.gHPZBs.media-viewer > div:nth-child(4) > img'
  ).attr('src');

  return imageUrl;
}

async function savePicture(scrapingResult) {
  regularRequest
    .get(scrapingResult.posterUrl)
    .pipe(fs.createWriteStream('./posters/' + scrapingResult.rank + '.png'));
}

async function main() {
  const scrapingResults = await scrape();
  async.eachLimit(scrapingResults, 3, async function (scrapingResult) {
    try {
      console.log(scrapingResult);
      const mediaviewerUrl = await scrapeMediaviewer(scrapingResult.url);
      scrapingResult.mediaviewerUrl = 'https://www.imdb.com' + mediaviewerUrl;
      const posterUrl = await getPosterUrl(scrapingResult);
      scrapingResult.posterUrl = posterUrl;
      await savePicture(scrapingResult);
    } catch (err) {
      console.error(err);
    }
  });
}
main();
