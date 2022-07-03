const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

// start page
const baseUrl =
  'https://www.airbnb.com/s/Copenhagen--Denmark/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&query=Copenhagen%2C%20Denmark&place_id=ChIJIz2AXDxTUkYRuGeU5t1-3QQ&date_picker_type=calendar&source=structured_search_input_header&search_type=user_map_move&ne_lat=55.70287703953947&ne_lng=12.688211648566494&sw_lat=55.61989273144911&sw_lng=12.489256112677822&zoom=13&search_by_map=true&federated_search_session_id=fa258963-7e71-4ce8-9657-d6dcaa1d3b2d&pagination_search=true';

// change offset by 20 to cycle through pages
// https://www.airbnb.com/s/Copenhagen--Denmark/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&query=Copenhagen%2C%20Denmark&place_id=ChIJIz2AXDxTUkYRuGeU5t1-3QQ&date_picker_type=calendar&source=structured_search_input_header&search_type=user_map_move&ne_lat=55.70287703953947&ne_lng=12.688211648566494&sw_lat=55.61989273144911&sw_lng=12.489256112677822&zoom=13&search_by_map=true&federated_search_session_id=fa258963-7e71-4ce8-9657-d6dcaa1d3b2d&pagination_search=true&items_offset=80&section_offset=3

// sample object
const object = {
  guests: 1,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  price: 350,
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// take away
function returnMatches(text, regex) {
  const regExMatch = text.match(regex);
  let result = 'N/A';
  if (regExMatch != null) {
    result = regExMatch[0];
  } else {
    throw `No regex matches found for: ${regex}`;
  }
  return result;
}

let browser;

async function scrapeHomesInIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // $("[itemprop='url']").attr('content') -> element to be used in our cherrio query

    // const html = await page.content(); similat with down below
    const html = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    const $ = await cheerio.load(html);

    // find all homes and map each one to the url that contains our info
    return $("[itemprop='url']")
      .map((index, element) => 'https://' + $(element).attr('content'))
      .get();
  } catch (error) {
    console.log(error);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    // need to wait for selector otherwise i need to use sleep()
    await page.waitForSelector(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(1) > div > span > span'
    );

    const $ = cheerio.load(html);

    const pricePerNight = $(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div:nth-child(1) > div > span > span'
    ).text();
    const allowedGuests = $(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div:nth-child(1) > div > div > section > div > div > div > div > ol > li:nth-child(1) > span'
    ).text();
    const bedrooms = $(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div:nth-child(1) > div > div > section > div > div > div > div > ol > li:nth-child(2) > span:nth-child(2)'
    ).text();
    const baths = $(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div:nth-child(1) > div > div > section > div > div > div > div > ol > li:nth-child(4) > span:nth-child(2)'
    ).text();
    const beds = $(
      '#site-content > div > div:nth-child(1) > div:nth-child(3) > div > div > div > div:nth-child(1) > div > div > section > div > div > div > div > ol > li:nth-child(3) > span:nth-child(2)'
    ).text();

    return {
      url,
      pricePerNight,
      allowedGuests,
      bedrooms,
      baths,
      beds,
    };
  } catch (error) {
    console.error(url);
    console.error(error);
  }
}

async function main() {
  browser = await puppeteer.launch({ headless: true });
  const descriptionPage = await browser.newPage();
  const homes = await scrapeHomesInIndexPage(baseUrl);

  if (homes.length > 0) {
    for (let i = 0; i < homes.length; i++) {
      const results = await scrapeDescriptionPage(homes[i], descriptionPage);
      console.log(results);
    }
  }

  await browser.close();
}

main();
