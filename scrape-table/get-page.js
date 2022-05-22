const request = require('request-promise');
const fs = require('fs');

async function main() {
  const html = await request.get(
    'https://www.codingwithstefan.com/table-example/'
  );
  fs.writeFileSync('./scrape-table.html', html);
}

main();
