import puppeteer from 'puppeteer';
import fs from 'fs';

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

(async () => {
    const username = 'daily.dev.ar';
    const password = '2aD62D8080E&&';
    const browser = await puppeteer.launch({
        headless: !false, defaultViewport: null, args: ['--start-maximized'], userDataDir: './myUserDataDir',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/daily.dev.ar', { timeout: 0 });
    console.log("Here");
    await page.waitForSelector("ul > li:nth-child(3) > a");
    await page.click("ul > li:nth-child(3) > a");
    await sleep(1000);
    await page.exposeFunction('sleep', sleep);
    let accouts = await page.evaluate(async () => {
        let res = await new Promise(async (resolve, reject) => {
            let el = document.querySelector("div[style='display: flex; flex-direction: column; height: 100%; max-width: 100%;'] > div > :nth-child(3)");
            await sleep(2000);
            var totalHeight = 0;
            var distance = 500;
            var timer = setInterval(async () => {
                let el_height = el.scrollHeight;
                el.scrollBy(0, distance);
                await sleep(2000);
                totalHeight += distance;
                let accounts = []
                let result =
                    el.querySelectorAll("div[aria-labelledby] :nth-child(3) > button")
                result.forEach(e => { { accounts.push(e?.parentNode?.parentNode?.querySelector("a")?.href)} })
                result = []
                console.log(el.scrollHeight + " " + el_height);
                if (el.scrollHeight == el_height) {
                    result = []
                    result = el.querySelectorAll("div[aria-labelledby] :nth-child(3) > button")
                    result.forEach(e => { { accounts.push(e?.parentNode?.parentNode?.querySelector("a")?.href) } })
                    clearInterval(timer);
                    resolve(accounts);
                }
            }, 1000);
        });
        return res;
    });
    accouts = accouts.filter((v, i, a) => a.indexOf(v) === i);
    console.log(accouts.length);
    fs.writeFileSync('daily.dev.json', JSON.stringify(accouts));
    await browser.close();
})();