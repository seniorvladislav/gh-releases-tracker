const needle = require("needle");
const checkIfRepoExists = require("./checkRepo");

async function getDownloadsCount(owner, repo) {
  const repoExists = await checkIfRepoExists({ owner, repo });

  // console.log("Repo Exists:", repoExists);

  if (!repoExists) {
    return Promise.reject(`Repository doesn't even exist!`);
  }

  const apiEndpoint = `https://api.github.com/repos/${owner}/${repo}/releases`;

  const response = await needle("get", apiEndpoint);

  let { body: releases } = response;

  // return console.log(body);

  console.log(response.statusCode, response.statusMessage);

  if (response.statusCode === 403) {
    return Promise.reject("Rate Limit Exceeded. Try some time later.");
  }

  // console.log("Releases Count: ", releases.length);

  releases = releases.filter((rel) => rel.assets && rel.assets.length);

  if (!releases.length) {
    return Promise.reject(`No releases available for ${owner}/${repo}`);
  }

  // if (
  //   releases.some((rel) => !rel.assets.length) // ||
  //   // !Object.prototype.toString.call(releases).endsWith("Array]")
  // ) {
  //   // console.log(releases, " DEBUG");
  //   return Promise.reject(`No releases available for ${owner}/${repo}`);
  //   // return Promise.reject(
  //   //   `There's no assets exposed by Github API for ${owner}/${repo}`
  //   // );
  // }

  // return console.log(releases);

  // if (!releases.every((release) => release.assets.length)) {

  // }

  const mapped = releases.map((release) => {
    return release.assets.map(
      ({ browser_download_url, created_at, download_count }) => {
        return {
          browser_download_url,
          created_at,
          download_count,
        };
      }
    )[0];
  });

  // console.log(mapped);

  return Promise.resolve(mapped);
}

module.exports = getDownloadsCount;
