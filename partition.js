const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const numOfServer = 40; 
const ignoreList = fs.readFileSync(path.join(__dirname, 'ignore_list.txt'), 'utf8').trim().split('\n');
const readyFolder = path.join(__dirname, 'ready-to-fuzz-contracts');
let readyFiles = fs.readdirSync(readyFolder);
readyFiles.sort((a, b) => {
  const textA = a.toUpperCase();
  const textB = b.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
})
// rimraf.sync(path.join(__dirname, 'partition'));
rimraf.sync(path.join(__dirname, 'running'));
// fs.mkdirSync(path.join(__dirname, 'partition'));
fs.mkdirSync(path.join(__dirname, 'running'));
console.log(`BEFORE: ${readyFiles.length}`);
readyFiles = readyFiles.filter(x => !ignoreList.includes(x));
console.log(`AFTER: ${readyFiles.length}`);
const step = Math.ceil(readyFiles.length / numOfServer);
for (let i = 0; i < numOfServer; i ++) {
  // let from = i * step;
  // let to  = (i + 1) * step;
  // Create folder
  // const partitionFolder = path.join(__dirname, `partition/eth${i}`);
  const runFolder = path.join(__dirname, `running/eth${i}`);
  // fs.mkdirSync(partitionFolder);
  fs.mkdirSync(runFolder);
  // console.log(readyFiles.slice(from, to).length);
  // readyFiles.slice(from, to).forEach((f) => {
    // fs.copyFileSync(path.join(readyFolder, f), path.join(partitionFolder, f));
  // })
}
