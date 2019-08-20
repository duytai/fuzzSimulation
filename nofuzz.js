const fs = require('fs');
const path = require('path');

const runningFolder = path.join(__dirname, 'running');
const ignoreFile = path.join(__dirname, 'ignore_list.txt'); 
let ignoreList = [];
fs.readdirSync(runningFolder).forEach(folder => {
  const resultFile = path.join(runningFolder, folder, 'results/success.txt');
  const failFile = path.join(runningFolder, folder, 'results/fail.txt');
  const sucContent = fs.readFileSync(resultFile, 'utf8').trim();
  const faiContent = fs.readFileSync(failFile, 'utf8').trim();
  if (!sucContent.length) {
    console.log(resultFile);
    process.exit(1);
  }
  if (faiContent.length) {
    ignoreList = ignoreList.concat(faiContent.split('\n'));
  }
})
fs.writeFileSync(ignoreFile, ignoreList.join('\n'), 'utf8');
