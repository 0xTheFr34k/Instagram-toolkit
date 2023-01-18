import puppeteer from 'puppeteer';

const uploadVideo = async (page, videoPath) => {
    try {
        console.log('>>> try load video');
        const fileInputSelector = 'input[accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"]';
        await page.waitForSelector(fileInputSelector);
        const fileInput = await page.$(fileInputSelector);
        await fileInput.uploadFile(videoPath);
        console.log('>>> load video in progress');
    } catch (error) {
        console.log('error: ', error);
        await sleep(1000);
        await uploadVideo(page, videoPath);
    }
};

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
(async () => {
    const username = 'daily.dev.ar';
    const password = '2aD62D8080E&&';
    const browser = await puppeteer.launch({
        headless: false, defaultViewport: null, args: ['--start-maximized'], userDataDir: './myUserDataDir',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForXPath('//div/div/div/div[1]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[7]/div/div/a/div');
    const upload_button = await page.$x('//div/div/div/div[1]/div/div/div/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div[7]/div/div/a/div');
    await upload_button[0].click();
    await uploadVideo(page, 'SampleVideo_1280x720_1mb.mp4');
    await page.waitForXPath('//button[contains(text(), "Next")]');
    let nextButton = await page.$x('//button[contains(text(), "Next")]');
    await nextButton[0].click();
    await sleep(3000);
    await page.waitForXPath('//button[contains(text(), "Next")]');
    nextButton = await page.$x('//button[contains(text(), "Next")]');
    await nextButton[0].click();
    await page.waitForXPath('//button[contains(text(), "Share")]');
    const shareButton = await page.$x('//button[contains(text(), "Share")]');
    await shareButton[0].click();
})();