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
rimraf.sync(path.join(__dirname, 'running'));
fs.mkdirSync(path.join(__dirname, 'partition'));
fs.mkdirSync(path.join(__dirname, 'running'));
for (let i = 0; i < numOfServer; i ++) {
  let from = i * step;
  let to  = (i + 1) * step;
  // Create folder
  const partitionFolder = path.join(__dirname, `partition/eth${i}`);
  const runFolder = path.join(__dirname, `running/eth${i}`);
  fs.mkdirSync(partitionFolder);
  fs.mkdirSync(runFolder);
  readyFiles.slice(from, to).forEach((f) => {
    fs.copyFileSync(path.join(readyFolder, f), path.join(partitionFolder, f));
  })
}
