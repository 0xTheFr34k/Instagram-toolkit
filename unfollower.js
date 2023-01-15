import puppeteer from "puppeteer";
import ora from "ora"

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function IG_Unfollower(username, password, fName) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
    const page = await browser.newPage();
    let spinner = ora(`[IG:@${fName}] Unfollowing please wait`).start();
    await page.goto('https://www.instagram.com/accounts/login/');
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", username, { delay: 30 });
    await page.type("input[name='password']", password, { delay: 30 });
    await page.click("button[type='submit']");
    await page.waitForNavigation();
    await page.goto(`https://www.instagram.com/${fName}/`);
    await page.waitForSelector("ul > li:nth-child(3) > a");
    await page.click("ul > li:nth-child(3) > a");
    await sleep(1000);
    await page.exposeFunction('sleep', sleep);
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let el = document.querySelector("div[style='display: flex; flex-direction: column; height: 100%; max-width: 100%;'] > div > :nth-child(3)");
            async function unfollow(result) {
                result.forEach(async (e) => {
                    // await sleep(3000)
                    if (e.innerText == "Following")
                    {
                        await e.click()
                        document.querySelectorAll("div[style='display: flex; flex-direction: column; height: 100%; max-width: 100%;'] > div > div:nth-child(3)")[1].querySelectorAll("button")[0].click()
                    }
                    if (document.querySelectorAll('div[role="dialog"] > div[style="display: flex; flex-direction: column; height: 100%; max-width: 100%;"]')[1] != undefined)
                        resolve();
                });
            }
            var totalHeight = 0;
            var distance = 50;
            var timer = setInterval(async () => {
                el.scrollBy(0, distance);
                totalHeight += distance;
                let accounts = []
                let result =
                    el.querySelectorAll("div[aria-labelledby] :nth-child(3) > button")
                result.forEach(e => { { if (e.innerText == "Following") accounts.push(e) } })
                unfollow(accounts);
                if (accounts.length >= 180) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
    spinner.stop();
    await browser.close();
}

export default IG_Unfollower;
