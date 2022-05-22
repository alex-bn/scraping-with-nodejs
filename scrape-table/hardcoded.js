const request = require('request-promise');
const cheerio = require('cheerio');

async function main() {
  const getHtml = await request.get(
    'https://www.codingwithstefan.com/table-example/'
  );
  const $ = cheerio.load(getHtml);

  const tableRows = [];

  const trs = $('body > table > tbody > tr');
  trs.each((index, element) => {
    if (index === 0) return;

    const tds = $(element).find('td');
    const company = $(tds[0]).text();
    const contact = $(tds[1]).text();
    const country = $(tds[2]).text();

    const row = { company, contact, country };

    tableRows.push(row);
  });

  console.log(tableRows);
}

main();
