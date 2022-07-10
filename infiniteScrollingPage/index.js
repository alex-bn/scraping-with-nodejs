const puppeteer = require('puppeteer');

function extractItems() {
  const extractedItems = Array.from(
    document.querySelectorAll('#boxes > div.box')
  );
  const items = extractedItems.map(element => element.innerText);
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  targetItemCount,
  delay = 1000
) {
  let items = [];

  try {
    let previousHeight;
    while (items.length < targetItemCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      await page.waitForTimeout(delay);
    }
  } catch (error) {
    console.log(error);
  }

  return items;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 960 });

  await page.goto('https://intoli.com/blog/scrape-infinite-scroll/demo.html');

  const targetItemCount = 100;

  // test
  // const result = await page.evaluate(extractItems);
  // console.log(result);

  const items = await scrapeInfiniteScrollItems(
    page,
    extractItems,
    targetItemCount
  );
  console.log(items);

  await browser.close();
}

main();
