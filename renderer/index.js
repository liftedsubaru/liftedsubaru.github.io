// TODO this should probably all be redone with webpack or gulp
const handlebars = require('handlebars'); // eslint-disable-line
const friendlyUrl = require('friendly-url');
const fs = require('fs');
const template = require('./template.hbs');

const ROOTURL= 'https://liftedsubaru.github.io'
const detailPageConfigs = [];

function renderHomePage() {
  return template({
    home: true,
    detailPageConfigs,
    ROOTURL,
  });
}

function renderListView() {
  return template({
    list: true,
    detailPageConfigs,
    ROOTURL,
  });
}

function renderDetailPage(detail) {
  detail.detailpage = true;
  detail.ROOTURL = ROOTURL
  return template(detail);
}

function saveFiles(contentHash, i, cb) {
  const key = Object.keys(contentHash)[i];
  const value = contentHash[key];
  i += 1;
  // . prefix important
  fs.writeFile(`.${key}`, value, (err) => {
    if (err) return console.log(err);
    console.log(`SAVED: ${key}`);
    if (i < Object.keys(contentHash).length) {
      return saveFiles(contentHash, i, cb);
    }
    return cb();
  });
}

function init(cb) {
  const dirname = './detail-pages';
  fs.readdir(dirname, (err, filenames) => {
    filenames.forEach((filename) => {
      fs.readFile(`${dirname}/${filename}`, 'utf-8', (error, content) => {
        if (error) return null;
        detailPageConfigs.push(JSON.parse(content));
        if (detailPageConfigs.length === filenames.length) cb();
      });
    });
  });
}

function main() {
  const html = {};
  const parsedConfigs = [];

  detailPageConfigs.forEach((detail, i) => {
    const url = `./detail-page/${friendlyUrl(detail.title)}.html`; // fileName
    html[url] = renderDetailPage(detail);
    const tempDetail = detail;
    tempDetail.url = url;
    tempDetail.id = i; // it can change each time, just for muri grid
    parsedConfigs.push(tempDetail);
  });

  html['./index.html'] = renderHomePage(parsedConfigs);
  html['./list.html'] = renderListView(parsedConfigs);

  saveFiles(html, 0, () => {
    console.log('\nDone.');
  });
}

// TODO: Should pages be deleted before Re-render?
init(main);

// Unused, might be needed

/* @params string,
    @params int,
*/
function abbreviate(inputString, k) {
  if (inputString.length > k) {
    const charactersAllowed = k - 3; // 3 for my dot dot dots
    return `${inputString.slice(0, charactersAllowed)}...`;
  }
  return inputString;
}
