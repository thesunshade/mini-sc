const suttaArea = document.getElementById("sutta");

function buildSutta(slug) {
  let html = "";
  const rootResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/root/pli/ms/sutta/${slug}_root-pli-ms.json`
  )
    .then(response => response.json())
    .catch(error => {
      suttaArea.innerHTML = "Sorry, that's not a valid sutta citation";
    });
  const translationResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/translation/en/sujato/sutta/${slug}_translation-en-sujato.json`
  ).then(response => response.json());
  const htmlResponse = fetch(
    `https://raw.githubusercontent.com/suttacentral/bilara-data/published/html/pli/ms/sutta/${slug}_html.json`
  ).then(response => response.json());
  Promise.all([rootResponse, translationResponse, htmlResponse]).then(responses => {
    const [paliData, transData, htmlData] = responses;

    Object.keys(htmlData).forEach(segment => {
      if (transData[segment] === undefined) {
        transData[segment] = "";
      }
      const [openHtml, closeHtml] = htmlData[segment].split(/{}/);
      html += `${openHtml}<span class="pli-lang" lang="pi">${paliData[segment]}</span><span class="eng-lang" lang="en">${transData[segment]}</span>${closeHtml}`;
    });
    const scLink = `<p class="sc-link"><a href="https://suttacentral.net/${slug}/en/sujato">On SuttaCentral.net</a></p>`;
    suttaArea.innerHTML = scLink + html;
    const pageTile = document.querySelector("h1");
    document.title = pageTile.textContent;
  });
}

buildSutta(parseSlug(document.location.search.replace("?", "")));

function parseSlug(slug) {
  const slugParts = slug.match(/^([a-z]+)(\d*)\.*(\d*)/);
  const book = slugParts[1];
  const firstNum = slugParts[2];

  console.log(book);
  if (book === "dn" || book === "mn") {
    return `${book}/${slug}`;
  } else if (book === "sn" || book === "an") {
    return `${book}/${book}${firstNum}/${slug}`;
  }
}
