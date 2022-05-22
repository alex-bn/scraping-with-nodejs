const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

async function main() {
  const html = await request.get(
    'https://www.codingwithstefan.com/table-example/'
  );
  const $ = cheerio.load(html);

  let headers = [];
  let rows = [];

  $('body > table > tbody > tr').each((index, element) => {
    if (index === 0) {
      $(element)
        .find('th')
        .each((index, element) => {
          headers.push($(element).text().toLowerCase());
        });
      return;
    }

    let row = {};

    $(element)
      .find('td')
      .each((index, element) => {
        row[headers[index]] = $(element).text();
      });
    rows.push(row);
  });

  console.log(rows);
  fs.writeFileSync('./data.txt', JSON.stringify(rows));
}
main();
