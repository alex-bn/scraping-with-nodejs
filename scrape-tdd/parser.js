const cheerio = require('cheerio');

exports.add = (a, b) => a + b;

exports.compareDate = (date1, date2) => (date1 === date2 ? true : false);

exports.listings = html => {
  const $ = cheerio.load(html);

  return $('.result-info')
    .map((index, element) => {
      const titleElement = $(element).find('.result-title.hdrlnk');

      const title = titleElement.text();
      const url = titleElement.attr('href');
      const neighborhood = getHood($, element);
      const datePosted = getDate($, element);

      return { title, url, neighborhood, datePosted };
    })
    .get();
};

function getDate($, element) {
  return new Date($(element).find('.result-date').attr('datetime'));
}

function getHood($, element) {
  return $(element).find('.result-hood').text().trim();
}
