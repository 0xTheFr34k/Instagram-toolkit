import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import puppeteer from 'puppeteer';

const sleep = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

async function xpath(page, xpath, callback = (el) => { return el }) {
    try {
        await page.waitForXPath(xpath, { timeout: 10000 })
        const result = await page.$x(xpath)
        return callback(result[0])
    }
    catch (error) { }
}

const getFollowing = async (IG_USERNAME, IG_PASSWORD) => {
    let result = []
    console.log("Getting following");
    const ig = new IgApiClient();
    ig.state.generateDevice(IG_USERNAME);
    const auth = await ig.account.login(IG_USERNAME, IG_PASSWORD);
    const followingsFeed = ig.feed.accountFollowing(auth.pk);
    const items = await followingsFeed.items();
    result = [...result, ...items]
    while (followingsFeed.isMoreAvailable() == true) {
        const items = await followingsFeed.items();
        result = [...result, ...items]
        followingsFeed.serialize()
        await sleep(5000);
    }
    console.log(`${result.length} following ${IG_USERNAME}`);
    result = result.map(e => "https://www.instagram.com/" + e.username)
    fs.writeFileSync(`./posts_json/${IG_USERNAME}.json`, JSON.stringify(result))
}

const RandRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const RandComment = async () => {
    const comments = [
        "I love your posts"
    ]
    return comments[Math.floor(Math.random() * comments.length)]
}

async function SendDm (username,password)  {
    await getFollowing(username, password)
    const following = JSON.parse(fs.readFileSync(`./posts_json/${username}.json`))
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login/');
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", username, { delay: 30 });
    await page.type("input[name='password']", password, { delay: 30 });
    await page.click("button[type='submit']");
    await page.waitForNavigation();
    let i = 0;
    for (const profile of following) {
        i++;
        if (i % 10 == 0) {
            console.log(`sleeping for 10mins`);
            await sleep(60000 * 10);
        }
        await page.goto(profile, { timeout: 0 });
        await xpath(page, '//div/div/div/div[1]/div/div/div/div[1]/div[1]/div[2]/section/main/div/header/section/div[1]/div[2]/div/div[2]/div', (el) => el.click())
        await page.waitForNavigation();
        await xpath(page, '//div/div/div/div[1]/div/div/div/div[1]/div[1]/div/div[2]/div/section/div/div/div/div/div[2]/div[2]/div/div[2]/div/div/div[2]/textarea', async (el) => el.type(await RandComment()))
        await sleep(RandRange(2000, 4000));
        await xpath(page, '//div/div/div/div[1]/div/div/div/div[1]/div[1]/div/div[2]/div/section/div/div/div/div/div[2]/div[2]/div/div[2]/div/div/div[3]/button', (el) => el.click())
        let rand = RandRange(10000, 20000)
        console.log(`sleeping for ${rand}ms`);
        await sleep(rand);
    }
}

export default SendDm;