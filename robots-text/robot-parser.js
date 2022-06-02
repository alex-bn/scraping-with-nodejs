const robotParser = require('robots-parser');
const request = require('request-promise');

const robotsUrl = 'https://textfiles.meulie.net/robots.txt';

async function getRobotsText(robotsUrl) {
  const robotTxt = await request.get(robotsUrl);
  const robots = robotParser(robotsUrl, robotTxt);
  console.log(robots.isAllowed('https://textfiles.meulie.net/100/', 'TstBoot'));
  console.log(
    robots.isAllowed('https://textfiles.meulie.net/100/', 'rogerbot')
  );
  console.log(robots.getCrawlDelay());
}
getRobotsText(robotsUrl);
