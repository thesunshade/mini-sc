const suttaArea = document.getElementById("sutta");
const homeButton = document.getElementById("home-button");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

homeButton.addEventListener("click", () => {
  document.location.search = "";
});

const form = document.getElementById("form");
const citation = document.getElementById("citation");
citation.focus();

form.addEventListener("submit", e => {
  e.preventDefault();
  // to add hard breaks in verses, add:
  // document.location.search = "?" + citation.value.replace(/\s/g, "");
  buildSutta(citation.value.replace(/\s/g, ""));
  history.pushState({ page: citation.value.replace(/\s/g, "") }, "", `?${citation.value.replace(/\s/g, "")}`);
});

citation.value = document.location.search.replace("?", "").replace(/%20/g, "").replace(/\s/g, "");

function buildSutta(slug) {
  let translator = "sujato";
  slug = slug.toLowerCase();

  if (slug.match(/bu|bi|kd|pvr/)) {
    translator = "brahmali";
    slug = slug.replace(/bu([psan])/, "bu-$1");
    slug = slug.replace(/bi([psn])/, "bi-$1");
    if (!slug.match("pli-tv-")) {
      slug = "pli-tv-" + slug;
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bu-", "bu-vb-");
    }
    if (!slug.match("vb-")) {
      slug = slug.replace("bi-", "bi-vb-");
    }
  }

  let html = `<div class="button-area"><button id="hide-pali" class="hide-button">Toggle Pali</button></div>`;

  const contentResponse = fetch(`https://suttacentral.net/api/bilarasuttas/${slug}/${translator}?lang=en`).then(
    response => response.json()
  );

  const suttaplex = fetch(`https://suttacentral.net/api/suttas/${slug}/${translator}?lang=en&siteLanguage=en`).then(
    response => response.json()
  );

  Promise.all([contentResponse, suttaplex])
    .then(responses => {
      const [contentResponse, suttaplex] = responses;
      const { html_text, translation_text, root_text, keys_order } = contentResponse;
      keys_order.forEach(segment => {
        if (translation_text[segment] === undefined) {
          translation_text[segment] = "";
        }
        let [openHtml, closeHtml] = html_text[segment].split(/{}/);
        // openHtml = openHtml.replace(/^<span class='verse-line'>/, "<br><span class='verse-line'>");
        html += `${openHtml}<span class="segment" id ="${segment}"><span class="pli-lang" lang="pi">${
          root_text[segment] ? root_text[segment] : ""
        }</span><span class="eng-lang" lang="en">${translation_text[segment]}</span></span>${closeHtml}\n\n`;
      });
      const scLink = `<p class="sc-link"><a href="https://suttacentral.net/${slug}/en/sujato">On SuttaCentral.net</a></p>`;

      let translatorName = "Bhikkhu Sujato";
      if (translator === "brahmali") translatorName = "Bhikkhu Brahmali";
      const translatorByline = `<div class="byline">Translated by ${translatorName}</div>`;
      suttaArea.innerHTML = scLink + html + translatorByline;
      document.title = `${suttaplex.bilara_root_text.title}: ${suttaplex.bilara_translated_text.title} ??? Bhikkhu Sujato ??? SuttaCentral`;

      toggleThePali();

      next.innerHTML = suttaplex.root_text.next.name
        ? `<a href="?${suttaplex.root_text.next.uid}">${suttaplex.root_text.next.name}<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
              <path d="M202.1 450C 196.03278 449.9987 190.56381 446.34256 188.24348 440.73654C 185.92316 435.13055 187.20845 428.67883 191.5 424.39L191.5 424.39L365.79 250.1L191.5 75.81C 185.81535 69.92433 185.89662 60.568687 191.68266 54.782654C 197.46869 48.996624 206.82434 48.91536 212.71 54.6L212.71 54.6L397.61 239.5C 403.4657 245.3575 403.4657 254.8525 397.61 260.71L397.61 260.71L212.70999 445.61C 209.89557 448.4226 206.07895 450.0018 202.1 450z" stroke="none" fill="#000000" fill-rule="nonzero" />
        </g>
      </g>
      </svg></a>`
        : "";
      previous.innerHTML = suttaplex.root_text.previous.name
        ? `<a href="?${suttaplex.root_text.previous.uid}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="15" height="11">

      <g transform="matrix(0.021484375 0 0 0.021484375 2 -0)">
        <g>
              <path d="M353 450C 349.02106 450.0018 345.20444 448.4226 342.39 445.61L342.39 445.61L157.5 260.71C 151.64429 254.8525 151.64429 245.3575 157.5 239.5L157.5 239.5L342.39 54.6C 346.1788 50.809414 351.70206 49.328068 356.8792 50.713974C 362.05634 52.099876 366.10086 56.14248 367.4892 61.318974C 368.87753 66.49547 367.3988 72.01941 363.61002 75.81L363.61002 75.81L189.32 250.1L363.61 424.39C 367.90283 428.6801 369.18747 435.13425 366.8646 440.74118C 364.5417 446.34808 359.06903 450.00275 353 450z" stroke="none" fill="#000000" fill-rule="nonzero" />
        </g>
      </g>
      </svg>${suttaplex.root_text.previous.name}</a>`
        : "";
    })
    .catch(error => {
      suttaArea.innerHTML = `Sorry, "${decodeURIComponent(slug)}" is not a valid sutta citation.
    <br><br>
    Note: <br>
    Suttas that are part of a series require that you enter the exact series. For example, <code>an1.1</code> will not work, but <code>an1.1-10</code> will.<br>
    Chapter and sutta number should be separated by a period.<br>
    Only dn, mn, sn, and an are valid books.`;
    });
}

// initialize the whole app
if (document.location.search) {
  buildSutta(document.location.search.replace("?", "").replace(/\s/g, "").replace(/%20/g, ""));
} else {
  suttaArea.innerHTML = `<div class="instructions">
  <p>Citations must exactly match those found on SuttaCentral.net. Separate chapter and sutta with a period. The following collections work. Click them to add to input box.</p>
  <div class="lists">

  <div class="suttas">
  <h2>Suttas</h2>
  <ul>
      <li><span class="abbr">dn</span> D??gha-nik??ya</li>
      <li><span class="abbr">mn</span> Majjhima-nik??ya</li>
      <li><span class="abbr">sn</span> Sa???yutta-nik??ya</li>
      <li><span class="abbr">an</span> A???guttara-nik??ya</li>
      <li><span class="abbr">kp</span> Khuddakap?????ha</li>
      <li><span class="abbr">dhp</span> Dhammapada</li>
      <li><span class="abbr">ud</span> Ud??na</li>
      <li><span class="abbr">iti</span> Itivuttaka (1???112)</li>
      <li><span class="abbr">snp</span> Sutta-nip??ta</li>
      <li><span class="abbr">thag</span> Therag??th??</li>
      <li><span class="abbr">thig</span> Ther??g??th??</li>
  </ul>
  </div><div>
  <h2>Vinaya</h2>
  <div class="vinaya">
  <div>
  <h3>Bhikkhu</h3>
<ul>
<li><span class="abbr">bu-pj</span> P??r??jik??</li>
<li><span class="abbr">bu-ss</span> Sa???gh??dises??</li>
<li><span class="abbr">bu-ay</span> Aniyat??</li>
<li><span class="abbr">bu-np</span> Nissaggiy??-p??cittiy??</li>
<li><span class="abbr">bu-pc</span> P??cittiy??</li>
<li><span class="abbr">bu-pd</span> P?????idesan??y??</li>
<li><span class="abbr">bu-sk</span> Sekhiy??</li>
<li><span class="abbr">bu-as</span> Adhikarana-samatha</li>
</ul>
</div><div>
<h3>Bhikkhuni</h3>
<ul>
<li><span class="abbr">bi-pj</span> P??r??jik??</li>
<li><span class="abbr">bi-ss</span> Sa???gh??dises??</li>
<li><span class="abbr">bi-np</span> Nissaggiy??-p??cittiy??</li>
<li><span class="abbr">bi-pc</span> P??cittiy??</li>
<li><span class="abbr">bi-pd</span> P?????idesan??y??</li>
<li><span class="abbr">bi-sk</span> Sekhiy??</li>
<li><span class="abbr">bi-as</span> Adhikarana-samatha</li>
</ul>
</div>
<ul>
<li><span class="abbr">kd</span> Khandhakas</li>
<li><span class="abbr">pvr</span> Pariv??ra</li>
</ul>
</div>
  </div></div>

  <p>Suttas that are part of a series require that you enter the exact series. 
  (Such as Dhp and some SN and AN.)</p>
</div>
`;
}

function toggleThePali() {
  const hideButton = document.getElementById("hide-pali");

  // initial state
  if (localStorage.paliToggle) {
    if (localStorage.paliToggle === "hide") {
      suttaArea.classList.add("hide-pali");
    }
  } else {
    localStorage.paliToggle = "show";
  }

  hideButton.addEventListener("click", () => {
    if (localStorage.paliToggle === "show") {
      suttaArea.classList.add("hide-pali");
      localStorage.paliToggle = "hide";
    } else {
      suttaArea.classList.remove("hide-pali");
      localStorage.paliToggle = "show";
    }
  });
}

const abbreviations = document.querySelectorAll("span.abbr");
abbreviations.forEach(book => {
  book.addEventListener("click", e => {
    citation.value = e.target.innerHTML;
    // form.input.setSelectionRange(10, 10);
    citation.focus();
  });
});
