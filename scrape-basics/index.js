const request = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');

async function main() {
  //
  // #1 single element
  // const html = await request.get(
  //   'https://reactnativetutorial.net/css-selectors/'
  // );
  // fs.writeFileSync('./test.html', html);
  // const $ = cheerio.load(html);
  // const text = $('h1').text();
  // console.log(text);
  // console.log(html);
  //
  // #2 multiple elements
  // const html = await request.get(
  //   'https://reactnativetutorial.net/css-selectors/lesson2.html'
  // );
  // fs.writeFileSync('test2.html', html);
  // const $ = await cheerio.load(html);
  // $('h2').each((index, element) => {
  //   console.log($(element).text());
  // });
  // console.log(html);
  //
  // #3 id
  // const html = await request.get(
  //   'https://reactnativetutorial.net/css-selectors/lesson3.html'
  // );
  // fs.writeFileSync('./test3.html', html);
  // const $ = await cheerio.load(html);
  // const text = $('#red').text();
  // console.log(text);
  //
  // #4 class
  // const html = await request.get(
  //   'https://reactnativetutorial.net/css-selectors/lesson5.html'
  // );
  // fs.writeFileSync('./test4.html', html);
  // const $ = await cheerio.load(html);
  // $('h2.red').each((index, el) => {
  //   console.log($(el).text());
  // });
  //
  // #5 html attribute
  const html = await request.get(
    'https://reactnativetutorial.net/css-selectors/lesson6.html'
  );
  fs.writeFileSync('./test5.html', html);
  const $ = await cheerio.load(html);
  // with a certain value
  const text = $('[data-customer="22293"]').text();
  console.log(text);
  // with a certain attribute
  const text1 = $('[data-customer]').text();
  console.log(text1);
}
main();
