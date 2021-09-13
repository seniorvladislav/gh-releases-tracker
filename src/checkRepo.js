const needle = require("needle");

async function checkRepoExistence({ owner, repo }) {
  const apiEndpoint = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await needle("get", apiEndpoint);
  const { message } = response.body;
  return message !== "Not Found";
}

module.exports = checkRepoExistence;
