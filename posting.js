import puppeteer from 'puppeteer';

const uploadVideo = async (page, videoPath) => {
    try {
        const fileInputSelector = 'input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]';
        await page.waitForSelector(fileInputSelector);
        const fileInput = await page.$(fileInputSelector);
        await fileInput.uploadFile(videoPath);
        await sleep(2100);
    } catch (error) {
        await sleep(1000);
        await uploadVideo(page, videoPath);
    }
};

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function $x_button(page, xpath, { timeout = 30000 } = {}) {
    try {
        await page.waitForXPath(xpath, { timeout });
        const button = await page.$x(xpath);
        await button[0].click();

        await sleep(3000);
    } catch (error) { }
}
async function xpath(page, xpath, callback = (el) => { return el }) {
    await page.waitForXPath(xpath)
    const result = await page.$x(xpath)
    return callback(result[0])
}

async function Post(username, password) {
    const browser = await puppeteer.launch({
        headless: false, defaultViewport: null, args: ['--start-maximized'],
    });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login/');
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", `${username}`, { delay: 30 });
    await page.type("input[name='password']", `${password}`, { delay: 30 });
    await page.click("button[type='submit']");
    await page.waitForNavigation();
    await page.goto('https://www.instagram.com/', { timeout: 0 });
    await $x_button(page, '//div/div/div/div[1]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[7]/div/div/a/div')
    await uploadVideo(page, 'SampleVideo_1280x720_1mb.mp4');
    $x_button(page, '//div/div/div/div[2]/div/div/div[2]/div/div/div[1]/div/div[2]/div/div/div/div/div[2]/div/div/div[3]/div/div[4]/button', { timeout: 3000 })
    await $x_button(page, '//button[contains(text(), "Next")]')
    await $x_button(page, '//button[contains(text(), "Next")]')
    let message = "Hello World";
    await xpath(page, '//div/div/div/div[2]/div/div/div[1]/div/div[3]/div/div/div/div/div[2]/div/div/div/div[2]/div[2]/div/div/div/div[2]/div[1]/div[1]', (el) => {
        el.type(message);
    })
    await $x_button(page, '//button[contains(text(), "Share")]')
}

export default Post;