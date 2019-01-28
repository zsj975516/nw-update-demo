const exec = require('child_process').exec;

const iconv = require('iconv-lite');
const chalk = require('chalk');
const fs = require('fs');

const encoding = 'cp936';
const binaryEncoding = 'binary';

function cmdExec(cmd) {
  return new Promise(function (resolve) {
    const build = exec(cmd, {encoding: binaryEncoding});
    build.stdout.on('data', data => {
      console.log(iconv.decode(new Buffer(data, binaryEncoding), encoding));
    });
    build.stderr.on('data', error => {
      error = iconv.decode(new Buffer(error, binaryEncoding), encoding);
      console.log(chalk.red(error));
    });
    build.stdout.on('end', () => resolve());
    build.stdout.on('exit', () => resolve());
  })
}

module.exports.deleteDirAndFile = async function (dir) {
  if (!fs.existsSync(dir)) return;
  await cmdExec(`RD /S /Q "${dir}"`);
};

module.exports.deleteFile = async function (filePath) {
  if (!fs.existsSync(filePath)) return;
  await cmdExec(`DEL /Q "${filePath}"`);
};

module.exports.open = async function (path) {
  await cmdExec(`start "" "${path}"`);
};

module.exports.exec = cmdExec;


