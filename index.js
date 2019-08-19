const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const rimraf = require('rimraf');

const readyFolder = path.join(__dirname, 'ready-to-fuzz-contracts');
const runFolder = path.join(__dirname, 'contracts');
const resultFolder = path.join(__dirname, 'results');
const pwd = shell.pwd().toString();

const failFile = path.join(resultFolder, 'fail.txt');
const successFile = path.join(resultFolder, 'success.txt'); 
const finalStatFile = path.join(resultFolder, 'final.json');
[failFile, successFile, finalStatFile].forEach(f => {
  if (!fs.existsSync(f)) {
    fs.openSync(f, 'w');
  }
});

const readyFiles = fs.readdirSync(readyFolder);
readyFiles.forEach(filePath => {
  const fail = fs.readFileSync(failFile, 'utf8').trim().split('\n');
  const success = fs.readFileSync(successFile, 'utf8').trim().split('\n');
  const ok = fail.concat(success);
  if (ok.includes(filePath)) return;
  console.log(`Progess: ${ok.length}/${readyFiles.length}`);
  // Check if exists
  const readyFile = path.join(readyFolder, filePath);
  const runFile = path.join(runFolder, filePath);
  const statFile = path.join(runFolder, 'stats.json');
  const filename = filePath.split('_')[1].slice(0, -9);
  rimraf.sync(runFolder);
  fs.mkdirSync(runFolder);
  fs.copyFileSync(readyFile, runFile);
  shell.cd(pwd);
  shell.exec(`./fuzzer --file contracts/${filePath} --name ${filename} --assets assets/ --duration 5 --mode 0 --reporter 1 --attacker ReentrancyAttacker`);
  if (fs.existsSync(statFile)) {
    // Read result
    let curStat = JSON.parse(fs.readFileSync(statFile, 'utf8'));
    // Write to final 
    let finalStat = fs.readFileSync(finalStatFile, 'utf8');
    if (finalStat.length > 0) {
      finalStat = JSON.parse(finalStat); 
    } else {
      finalStat = {};
    }
    finalStat[filePath] = curStat;
    // write final
    fs.writeFileSync(finalStatFile, JSON.stringify(finalStat, null, 2));
    //
    fs.appendFileSync(successFile, `${filePath}\n`);
  } else {
    fs.appendFileSync(failFile, `${filePath}\n`);
  }
})