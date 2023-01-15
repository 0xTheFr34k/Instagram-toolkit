
import puppeteer from 'puppeteer';
import Downloader from "nodejs-file-downloader";
import fetch from 'node-fetch'
import instagramGetUrl from "instagram-url-direct";
import fs from 'fs';
import ora from "ora"

async function getLinks(fName) {
  let result = [];
  let spinner = ora(`[IG:@${fName}] extracting media links please wait`).start();
  const file = fs.readFileSync('links.txt', 'utf8').split('\n');
  for (const link of file) {
    let links = await instagramGetUrl(link);
    result = [...result, ...links.url_list];
  }
  result = [...new Set(result)];
  spinner.stop();
  return result;
}

async function downloadAll(file, folderName = "public") {
  let spinner = ora(`[IG:@${folderName}] downloding the media please wait`).start();
  for (const link of file) {
    const response = await fetch(link);
    let contentType = response.headers.get('content-type');
    const randomName = Math.random().toString(36).substring(7);
    const downloader = new Downloader({
      url: link,
      directory: `./media/${folderName}`,
      fileName: randomName + "." + contentType.split('/')[1]
    });
    try {
      const { filePath, downloadStatus } = await downloader.download();
    } catch (error) { }
  }
  spinner.stop();
}

async function IG_Downloader(username,password , link, fName){

  let spinner = ora(`[IG:@${fName}] browsing instagram please wait`).start();
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/');
  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']", username, { delay: 30 });
  await page.type("input[name='password']", password, { delay: 30 });
  await page.click("button[type='submit']");
  await page.waitForNavigation();
  await page.goto(link, { waitUntil: 'networkidle2', timeout: 0 });
  let result = await page.evaluate(async () => {
    let result = [];
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        const anchors = Array.from(document.getElementsByTagName("article")[0].querySelectorAll("a"));
        let links = anchors.map(anchor => anchor.href);
        result = [...result, ...links];
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
    return result;
  });
  result = [...new Set(result)];
  fs.writeFile('links.txt', result.join('\n'), function (err) {
    if (err) throw err;
  });
  await browser.close();
  spinner.stop()
  await downloadAll(await getLinks(fName),fName);
}

export default IG_Downloader;
