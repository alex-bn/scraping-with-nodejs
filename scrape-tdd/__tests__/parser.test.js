const parser = require('../parser');
const fs = require('fs');
let html;
let listings;

beforeAll(() => {
  html = fs.readFileSync('./testExamplePup.html');
  listings = parser.listings(html);
});

//
it('should get correct number of listings', () => {
  expect(listings.length).toBe(120);
});

// likely to have a different outcome at a different time
it('should get correct neighborhood', () => {
  expect(listings[0].neighborhood).toBe('(oakland piedmont / montclair)');
});

//
it('should get correct date', () => {
  expect(listings[0].datePosted).toStrictEqual(new Date('2022-05-23 09:11'));
});

//
it('should get correct url', () => {
  expect(listings[0].url).toBe(
    'https://sfbay.craigslist.org/eby/muc/d/blues-rb-world-music-band-available-for/7482115743.html'
  );
});

//
it('should get correct title', () => {
  expect(listings[0].title).toBe(
    'Blues/R&B/World Music band available for your event'
  );
});

// sample test
it('should give 4', () => {
  const result = parser.add(2, 2);
  expect(result).toBe(4);
});

// sample test
it('should should return false', () => {
  const result = parser.compareDate(
    new Date('2022-05-23 09:11'),
    new Date('2022-05-23 09:11')
  );
  expect(result).toBeFalsy();
  expect(result).toBe(false);
  expect(new Date('2022-05-23 09:11')).not.toBe(new Date('2022-05-23 09:11'));

  // although is exactly the same data, they occupy a different place in memory so in the end they're different although they contain the same property
});
