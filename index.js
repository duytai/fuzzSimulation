const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const rimraf = require('rimraf');
const Q = require('q');

//const readyFolder = path.join(__dirname, 'ready-to-fuzz-contracts');
const { PARTITION } = process.env; 
if (!PARTITION) {
  console.log('PLZ specify PARTITION environment');
  process.exit(0);
}
const readyFolder = path.join(__dirname, 'partition', PARTITION);
const runFolder = path.join(__dirname, 'running', PARTITION, 'contracts');
const resultFolder = path.join(__dirname, 'running', PARTITION, 'results');
const pwd = shell.pwd().toString();

const failFile = path.join(resultFolder, 'fail.txt');
const successFile = path.join(resultFolder, 'success.txt'); 
const finalStatFile = path.join(resultFolder, 'final.json');
if (!fs.existsSync(resultFolder)) {
  fs.mkdirSync(resultFolder);
}
[failFile, successFile, finalStatFile].forEach(f => {
  if (!fs.existsSync(f)) {
    fs.openSync(f, 'w');
  }
});
const timeout = (d) => Q.Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, d)
})
const main = async() => {
  const readyFiles = fs.readdirSync(readyFolder);
  for (let i = 0 ; i < readyFiles.length; i ++) {
    const filePath = readyFiles[i];
    const fail = fs.readFileSync(failFile, 'utf8').trim().split('\n');
    const success = fs.readFileSync(successFile, 'utf8').trim().split('\n');
    const ok = fail.concat(success);
    if (ok.includes(filePath)) continue;
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
    const child = shell.exec(`./fuzzer --file running/${PARTITION}/contracts/${filePath} --name ${filename} --assets assets/ --duration 120 --mode 0 --reporter 1 --attacker ReentrancyAttacker`, {async:true});
    await timeout(2 * 60 * 1000 + 5000);
    child.kill();
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
  }
}
main().then(() => {
  console.log('OK')
})
