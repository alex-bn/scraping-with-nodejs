const request = require('request-promise');

async function main() {
  const result = await request.get(
    'https://m.shop.nordstrom.com/api/search/blue%20dresses/?top=24&isMobile=true&origin=keywordsearch&offset=',
    {
      gzip: true,
      headers: {
        'User-Agent': 'PostmanRuntime/7.21.0',
        'Accept-Encoding': 'gzip, deflate',
      },
    }
  );
  console.log(result);
}

main();
