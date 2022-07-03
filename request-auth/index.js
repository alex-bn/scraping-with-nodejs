const request = require('request-promise').defaults({ jar: true });
const config = require('../config');
const fs = require('fs');

const proxy = `http://api.scraperapi.com/?api_key=${config.scrapeAPIKey}&url=`;
const loginUrl = 'https://accounts.craigslist.org/login';
const url = proxy + loginUrl;

async function main() {
  try {
    const html = await request.post(url, {
      form: {
        inputEmailHandle: 'stefanhyltoft@gmail.com',
        inputPassword: 'Fn&ET2Br45!z',
      },
      headers: {
        Referer:
          'https://accounts.craigslist.org/login?rt=L&rp=%2Flogin%2Fhome',
      },
      simple: false,
      followAllRedirects: true,
    });

    fs.writeFileSync('./login.html', html);
  } catch (error) {
    console.error(error);
  }
}

main();
