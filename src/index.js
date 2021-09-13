const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const getDownloadsCount = require("./downloadCount");
const isGithubUrl = require("is-github-url");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    maxWidth: 800,
    minWidth: 400,
    useContentSize: true,
    minHeight: 38,
    maxHeight: 600,
    resizable: false,
    // frame: true,
    // transparent: true,
    icon: path.join(__dirname, "static", "logos", "logo2.ico"),
    fullscreen: false,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, "static", "js", "app.js"),
      devTools: true,
    },
  });

  win.loadFile(path.join(__dirname, "static", "index.html"));

  win.removeMenu();
}
main();
async function main() {
  try {
    await app.whenReady();

    app.on(
      "window-all-closed",
      () => process.platform !== "darwin" && app.quit()
    );

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    ipcMain.on("submitForm", (event, { github_repo }) => {
      console.log(github_repo);

      const [, owner, repo] = github_repo.match(
        /https?:\/\/github.com\/([a-z0-9_-]+)\/([a-z0-9-_]+)/i
      );

      // console.log(owner, repo);

      getDownloadsCount(owner, repo)
        .then((releases) => event.sender.send("repoURLSubmit", releases))
        .catch((err) => {
          // if (err.message !== "Not Found") {
          console.error(err);
          // }
          event.sender.send("submissionError", { owner, repo, error: err });
        });
    });

    createWindow();
  } catch (err) {
    console.log(err);
  }
}
