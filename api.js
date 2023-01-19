import 'dotenv/config';
import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getFollowing = async (number) => {
  let result = []
  console.log("Getting following");
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME);
  ig.state.proxyUrl = process.env.IG_PROXY;
  const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  const followingsFeed = ig.feed.accountFollowing(auth.pk);
  const items = await followingsFeed.items();
  result = [...result, ...items]
  while (followingsFeed.isMoreAvailable() == true) {
    const items = await followingsFeed.items();
    result = [...result, ...items]
    followingsFeed.serialize()
    await sleep(5000);
  }
  if (result.length != number) 
    await getFollowing(number)
  console.log(result.length);
  result = result.map(e => "https://www.instagram.com/" + e.username)
  fs.writeFileSync('daily.dev.json', JSON.stringify(result));
}

getFollowing(254)