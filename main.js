import IG_Downloader from "./index.js";
import IG_Following from "./following.js";
import IG_Unfollower from "./unfollower.js";
import input from 'input';
import fs from 'fs'
import ora from "ora"


async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

(async () => {
    let op = ''
    let username = ''
    let password = ''
    let logins = []
    let users = fs.readFileSync('users.txt', 'utf8').split('\n')
    users = users.map(user => "https://www.instagram.com/" + user.trim())

    do {
        op = await input.select('select option', ['Simple-Login', 'Auto-Login'])
        switch (op) {
            case 'Simple-Login':
                username = await input.text("Enter you username:");
                password = await input.password("Enter you password:");
                break;
            case 'Auto-Login':
                {
                    logins = fs.readFileSync("logings.txt", 'utf8').split('\n')
                    username = "notEmpty"
                    password = "notEmpty"
                    break;
                }
        }
    } while (username == '' || password == '')

    do {
        op = await input.select('select option', ['IG-downloder', 'IG-follower', 'IG_Unfollower', 'Quit'])
        switch (op) {
            case 'IG-downloder':
                if (username == "notEmpty" && password == "notEmpty") {
                    for (const login of logins) {
                        for (const link of users) {
                            await IG_Downloader(login.split(":")[0], login.split(":")[1], link, link.split('/')[3])
                        }
                    }
                }
                else {
                    for (const link of users) {
                        await IG_Downloader(username, password, link, link.split('/')[3])
                    }
                }
                break;
            case 'IG-follower':
                if (username == "notEmpty" && password == "notEmpty") {
                    for (const login of logins) {
                        for (const link of users) {
                            await IG_Following(login.split(":")[0], login.split(":")[1], link)
                            let spinner = ora(`Sleeping 15m for bot detection`).start();
                            await sleep(15 * 60000)
                            spinner.stop();
                        }
                    }
                }
                else {
                    for (const link of users) {
                        await IG_Following(username, password, link)
                        let spinner = ora(`Sleeping 15m for bot detection`).start();
                        await sleep(15 * 60000)
                        spinner.stop();
                    }
                }
                break;
            case 'IG_Unfollower':
                if (username == "notEmpty" && password == "notEmpty") {
                    for (const login of logins) {
                        await IG_Unfollower(login.split(":")[0], login.split(":")[1], username)
                        let spinner = ora(`Sleeping 10m for bot detection`).start();
                        await sleep(10 * 60000)
                        spinner.stop();
                    }
                }
                else
                    await IG_Unfollower(username, password, username)
                break;
            case 'Quit':
                console.log('Quit')
        }
    } while (op != 'Quit')
})();