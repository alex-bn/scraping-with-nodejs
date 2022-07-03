let request = require('request-promise');
const puppeteer = require('puppeteer');

const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar });

async function main() {
  const result = await request.get('https://internshala.com/');
  const cookieString = cookieJar.getCookieString('https://internshala.com/');
  const splittedByCsrfCookieName = cookieString.split('csrf_cookie_name=');
  const csrf_test_name = splittedByCsrfCookieName[1].split(';')[0];

  const loginResult = await request.post(
    'https://internshala.com/login/verify_ajax/user',
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
      },
    },
    {
      form: {
        csrf_test_name,
        email: 'alex.i.bajan@gmail.com',
        password: 'Normativ!1',
      },
    }
  );

  console.log(loginResult);
}

main();

// puppeteer
async function pptrCookie() {
  async function intercept() {
    await page.setRequestInterception(true);
    page.on('request', request => {
      console.log('>>', request.method(), request.url(), request.postData());
      request.continue();
    });

    page.on('response', response => {
      console.log('<<', response.status(), response.url());
    });
  }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://internshala.com/');
  await page.setViewport({ width: 1920, height: 1080 });
  const loginSelector =
    '#header > div > nav > div.collapse.navbar-collapse.navbar_desktop > ul > li:nth-child(5) > button';
  await page.waitForSelector(loginSelector);
  await page.click(loginSelector);
  const loginForm = '#modal_login_submit';
  await page.waitForSelector(loginForm);
  await page.type('#modal_email', 'alex.i.bajan@gmail.com');
  await page.type('#modal_password', 'Normativ!1');

  await intercept();

  const client = await page.target().createCDPSession();
  const all_browser_cookies = (await client.send('Network.getAllCookies'))
    .cookies;
  const current_url_cookies = await page.cookies();
  const third_party_cookies = all_browser_cookies.filter(
    cookie => cookie.domain !== current_url_cookies[0].domain
  );

  console.log(all_browser_cookies); // All Browser Cookies
  console.log(current_url_cookies); // Current URL Cookies
  console.log(third_party_cookies); // Third-Party Cookies

  const [response] = await Promise.all([
    page.waitForNavigation(),
    page.click(loginForm),
  ]);
}

// pptrCookie();
