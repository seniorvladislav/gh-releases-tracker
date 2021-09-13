const moment = require("moment");

const { ipcRenderer } = require("electron");

const isGithubUrl = require("is-github-url");

// const isPlainGhUrl = (string) => {
//   const re = new RegExp(
//     "^(?:git|https?|git@)(?:\\:\\/\\/)?github.com[/|:][A-Za-z0-9-]+?\\/[\\w\\.-]+\\/?(?!=.git)(?:\\.git(?:\\/?|\\#[\\w\\.\\-_]+)?)?$",
//     "gi"
//   );
//   return re.test(string);
// };

window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  const form = document.querySelector("#github_repo");
  const input = form.querySelector("#url");
  const btn = form.querySelector("button");

  const $results = document.getElementById("results");
  const $errors = document.getElementById("errors");

  // input.addEventListener("input", async (event) => {
  btn.addEventListener("click", async (event) => {
    const value = input.value.trim();
    // const value = event.target.value.trim();

    // if (!value) {
    // if (document.querySelector("table")) {
    //   document.querySelector("table").remove();
    // }
    // return;
    // }

    const isValidUrl = isGithubUrl(value, {
      repository: true,
      strict: false,
    });
    // console.log(isValidUrl);

    if (!value || !isValidUrl) return;

    ipcRenderer.send("submitForm", {
      github_repo: value,
    });

    // if (/https?:\/\/github.com\/(\D+)\/(\D+)/gi.test(value)) {
    // input.value = "";

    // if (document.querySelector("#information")) {
    //   document.querySelector("#information").remove();
    // }
  });

  ipcRenderer.on("repoURLSubmit", async (event, releases) => {
    // console.dir(releases, {
    //   depth: null,
    // });

    $errors.innerHTML = "";

    try {
      await renderTable(releases, $results);
    } catch (err) {
      $errors.innerHTML = `
      <div id="information" class="text-center mt-3 shadow bg-danger py-2" style="font-weight: 400; font-family: Roboto; color: #fff;">${err}</div>
    `;
    }
  });

  ipcRenderer.on("submissionError", (event, { owner, repo, error }) => {
    $results.innerHTML = "";

    $errors.innerHTML = `
      <div id="information" class="text-center mt-3 shadow bg-danger py-2" style="font-weight: 400; font-family: Roboto; color: #fff;">${error.replace(
        /([a-z0-9])+\/([a-z-_])+/gi,
        `<strong>${error.match(/([a-z0-9])+\/([a-z-_])+/gi)}</strong>`
      )}</div>
    `;
  });
});

async function renderTable(data, target) {
  // if (data.some((v) => !v)) return Promise.reject("No Releases Found");
  // console.log(data);

  const table = document.createElement("table");
  table.classList.add("table", "table-dark", "table-striped", "text-center");
  table.style.marginBottom = 0;

  const thead = document.createElement("thead");
  thead.classList.add("header");

  const tbody = document.createElement("tbody");

  for (let i = 0; i < Object.keys(data[i]).length; i++) {
    const th = document.createElement("th");

    let heading = Object.keys(data[i])[i];

    if (heading === "browser_download_url") {
      continue;
    }

    switch (heading) {
      // case "browser_download_url":
      //   heading = "Ссылка на скачивание";
      //   break;
      case "created_at":
        heading = "Publish Date";
        break;
      case "download_count":
        heading = "Download Count";
        break;
    }

    th.textContent = heading;

    thead.appendChild(th);
    table.appendChild(thead);
  }

  const closingTableHeading = document.createElement("th");
  closingTableHeading.innerHTML = `
		Download URL
	`;

  thead.appendChild(closingTableHeading);

  data.forEach((rel) => {
    const tr = document.createElement("tr");
    tr.style.verticalAlign = "middle";

    const propLength = Object.keys(rel).length;

    for (let x = 0; x < propLength; x++) {
      const key = Object.keys(rel)[x];
      let value = Object.values(rel)[x];

      if (key === "browser_download_url") {
        continue;
      }

      if (key === "created_at") {
        value = moment(value).toDate().toLocaleDateString("en-GB");
        // value = moment(value).format("DD.MM.YYYY");
      }

      const td = document.createElement("td");

      td.textContent = value;

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  addDownloadReleaseLink(tbody, data);

  table.appendChild(tbody);
  target.innerHTML = "";
  target.appendChild(table);
}

function addDownloadReleaseLink(tableBody, data) {
  Array.from(tableBody.children).forEach((tr, idx) => {
    tr.innerHTML += `
			<td>
				<a href="${data[idx].browser_download_url}" class="btn btn-success btn-sm">Скачать релиз</a>
			</td>
		`;
  });
}
