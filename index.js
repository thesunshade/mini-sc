const suttaArea = document.getElementById("sutta");

function buildSutta(slug) {
  slug = slug.toLowerCase();
  let html = `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;

  const rootResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/root/pli/ms/sutta/${parseSlug(
      slug
    )}_root-pli-ms.json`
  )
    .then(response => response.json())
    .catch(error => {
      suttaArea.innerHTML = `Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.
      <br><br>
      Note: <br>
      Citations cannot contain spaces.<br>
      Chapter and sutta number should be separated by a period.<br>
      Only dn, mn, sn, and an are valid books.`;
    });
  const translationResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/translation/en/sujato/sutta/${parseSlug(
      slug
    )}_translation-en-sujato.json`
  ).then(response => response.json());
  const htmlResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/html/pli/ms/sutta/${parseSlug(
      slug
    )}_html.json`
  ).then(response => response.json());

  Promise.all([rootResponse, translationResponse, htmlResponse]).then(responses => {
    const [paliData, transData, htmlData] = responses;

    Object.keys(htmlData).forEach(segment => {
      if (transData[segment] === undefined) {
        transData[segment] = "";
      }
      const [openHtml, closeHtml] = htmlData[segment].split(/{}/);
      html += `${openHtml}<span class="pli-lang" lang="pi">${paliData[segment]}</span><span class="eng-lang" lang="en">${transData[segment]}</span>${closeHtml}\n\n`;
    });
    const scLink = `<p class="sc-link"><a href="https://suttacentral.net/${slug}/en/sujato">On SuttaCentral.net</a></p>`;
    suttaArea.innerHTML = scLink + html;
    const pageTile = document.querySelector("h1");
    document.title = pageTile.textContent;

    toggleThePali();
  });
}

// initialize
if (document.location.search) {
  buildSutta(document.location.search.replace("?", ""));
} else {
  suttaArea.innerHTML = `<div class="instructions">
  <p>Put a citation following the url, preceded by a "?" mark. For example:</p>
  <ul>
      <li>index.html?dn12</li>
      <li>index.html?mn123</li>
      <li>index.html?sn1.23</li>
      <li>index.html?an3.23</li>
  </ul>

  <p>Suttas that are part of a series require that you enter the exact series.</p>
</div>`;
}

function toggleThePali() {
  const paliSpans = document.querySelectorAll("p span.pli-lang, li span.pli-lang ");
  const englishSpans = document.getElementsByClassName("eng-lang");
  const hideButton = document.getElementById("hide-pali");

  function removePali() {
    for (let i = 0; i < paliSpans.length; i++) {
      paliSpans[i].classList.add("hide-pali");
    }
    for (let i = 0; i < paliSpans.length; i++) {
      englishSpans[i].classList.add("unblock-english");
    }
  }

  function addPali() {
    for (let i = 0; i < paliSpans.length; i++) {
      paliSpans[i].classList.remove("hide-pali");
    }
    for (let i = 0; i < paliSpans.length; i++) {
      englishSpans[i].classList.remove("unblock-english");
    }
  }

  // initial state
  if (localStorage.paliToggle) {
    if (localStorage.paliToggle === "hide") {
      removePali();
    }
  } else {
    localStorage.paliToggle = "show";
  }

  hideButton.addEventListener("click", () => {
    if (localStorage.paliToggle === "show") {
      removePali();
      localStorage.paliToggle = "hide";
    } else {
      addPali();
      localStorage.paliToggle = "show";
    }
  });
}

function parseSlug(slug) {
  const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
  const book = slugParts[1];
  const firstNum = slugParts[2];

  if (book === "dn" || book === "mn") {
    return `${book}/${slug}`;
  } else if (book === "sn" || book === "an") {
    return `${book}/${book}${firstNum}/${slug}`;
  }
}

const form = document.getElementById("form");
const citation = document.getElementById("citation");
form.addEventListener("submit", e => {
  e.preventDefault();
  buildSutta(citation.value);
  document.location.search = "?" + citation.value;
});

citation.value = document.location.search.replace("?", "");
