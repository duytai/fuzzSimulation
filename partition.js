const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const numOfServer = 40; 
const readyFolder = path.join(__dirname, 'ready-to-fuzz-contracts');
const readyFiles = fs.readdirSync(readyFolder);
const step = Math.ceil(readyFiles.length / numOfServer);
readyFiles.sort((a, b) => {
  const textA = a.toUpperCase();
  const textB = b.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
})
rimraf.sync(path.join(__dirname, 'partition'));
fs.mkdirSync(path.join(__dirname, 'partition'));
for (let i = 0; i < numOfServer; i ++) {
  let from = i * step;
  let to  = (i + 1) * step;
  // Create folder
  const partitionFolder = path.join(__dirname, `partition/eth${i}`);
  fs.mkdirSync(partitionFolder);
  readyFiles.slice(from, to).forEach((f) => {
    fs.copyFileSync(path.join(readyFolder, f), path.join(partitionFolder, f));
  })
}
