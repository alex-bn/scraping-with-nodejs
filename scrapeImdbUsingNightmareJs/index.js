const request = require('request-promise');
const regularRequest = require('request');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const puppeteer = require('puppeteer');
const fs = require('fs');
const nightmare = Nightmare();

// const sampleResult = {
//   title: 'Spiderhead',
//   rank: 1,
//   imdbRating: 5.4,
//   descriptionUrl:
//     'https://www.imdb.com/title/tt9783600/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=ea4e08e1-c8a3-47b5-ac3a-75026647c16e&pf_rd_r=0Z3BDKFYMZKE9HHWT80Y&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=moviemeter&ref_=chtmvm_tt_1',
//   posterUrl:
//     'https://www.imdb.com/title/tt9783600/mediaviewer/rm4200076033/?ref_=tt_ov_i',
//   posterImageUrl: 'imageUrl',
// };

async function scrapeStart() {
  const result = await request.get(
    'https://www.imdb.com/chart/moviemeter/?ref_=nv_mv_mpm'
  );
  const $ = await cheerio.load(result); // await ?

  const movies = $('tr')
    .map((i, element) => {
      const title = $(element).find('td.titleColumn > a').text();
      const imdbRating = $(element)
        .find('td.ratingColumn.imdbRating > strong')
        .text();
      const descriptionUrl =
        'https://www.imdb.com' +
        $(element).find('td.titleColumn > a').attr('href');
      // console.log({ title, imdbRating, rank: i, descriptionUrl });
      return { title, imdbRating, rank: i, descriptionUrl };
    })
    .get();
  return movies;
}

async function scrapePoster(movies) {
  // const browser = await puppeteer.launch({ headless: false });
  // const page = await browser.newPage();
  const moviesWithPosterUrls = await Promise.all(
    movies.map(async movie => {
      try {
        const html = await request.get(movie.descriptionUrl);

        // await page.goto(movie.descriptionUrl);
        // const html = await page.content();

        const $ = await cheerio.load(html);
        movie.posterUrl =
          'https://www.imdb.com' + $('.bmkYoJ > div > a').attr('href');
        return movie;
      } catch (error) {
        console.log(error);
      }
    })
  );
  return moviesWithPosterUrls;
}

async function scrapePosterImageUrl(movies) {
  for (let i = 0; i < movies.length; i++) {
    try {
      // const html = await request.get(movies[i].posterUrl);
      // const $ = await cheerio.load(html);

      //
      const posterImageUrl = await nightmare
        .goto(movies[i].posterUrl)
        .evaluate(() =>
          $(
            '#__next > main > div.ipc-page-content-container.ipc-page-content-container--full.sc-b1984961-0.kXDasd > div.sc-92eff7c6-1.gHPZBs.media-viewer > div:nth-child(4) > img'
          ).attr('src')
        );
      movies[i].posterImageUrl = posterImageUrl;
      savePosterImageToDisc(movies[i]);
      console.log(movies[i]);
    } catch (error) {
      console.log(error);
    }
  }
  return movies;
}

async function savePosterImageToDisc(movie) {
  regularRequest
    .get(movie.posterImageUrl)
    .pipe(fs.createWriteStream(`./posters/${movie.rank}.png`));
}

async function main() {
  let movies = await scrapeStart();
  movies = await scrapePoster(movies);
  // movies = await scrapePosterImageUrl(movies);
}

main();
// scrapeStart();
