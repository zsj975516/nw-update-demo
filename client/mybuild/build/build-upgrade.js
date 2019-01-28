/**
 * 生成升级配置文件 upgrade.json
 */
const path = require('path');
const YAML = require('yamljs');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');
const cmd = require('../util/CMD');


const platforms = {
  'win32-setup': {name: 'win32', ext: '.exe'},
  'win64-setup': {name: 'win64', ext: '.exe'},
  'osx32': {name: 'osx32', ext: '.app'},
  'osx64': {name: 'osx64', ext: '.app'},
  'linux32': {name: 'linux32', ext: '.gz'},
  'linux64': {name: 'linux64', ext: '.gz'}
};


async function makeUpgrade () {
  const basePath = path.resolve(config.buildPath, '../')
  try {
    let upgradeJson = {
      version: config.proPackage.version,
      releaseDate: new Date(),
      files: []
    };

    let fileNames = fs.readdirSync(basePath);
    fileNames = fileNames.filter(filename => /\.exe$/.test(filename))

    let files = fileNames.reduce((old, item) => {
      let stat = fs.statSync(path.resolve(basePath, item))
      let file
      if (/32/i.test(item)) {
        file = old[32]
      } else {
        file = old[64]
      }
      if (stat.mtimeMs > file.time) {
        file.platform = /x32/i.test(item) ? 'win32' : 'win64'
        file.url = item
        file.time = stat.mtimeMs
        file.size = stat.size
        return old
      }
      return old
    }, {32: {time: 0, size: 0}, 64: {time: 0, size: 0}})
    for (let key in files) {
      let file = files[key]
      file.md5 = await getMD5(path.resolve(basePath, file.url))
      delete file.time
      upgradeJson.files.push(file)
    }

    await makeJson(upgradeJson);
  } catch (e) {
    throw e;
  }
}

async function makeJson (upgradeJson) {
  try {
    let outputPath = path.dirname(config.upgrade.outputFile);
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

    fs.writeFileSync(config.upgrade.outputFile, YAML.stringify(upgradeJson, 4, 2), 'utf-8');
    console.log('文件打包完成');
    await cmd.open(outputPath);
  } catch (e) {
    throw e;
  }
}

function getMD5 (filepath) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(filepath)
    let fsHash = crypto.createHash('md5')
    stream.on('data', function (d) {
      fsHash.update(d)
    })
    stream.on('end', function () {
      let md5 = fsHash.digest('hex')
      resolve(md5)
    })
  })
}

module.exports.write = makeUpgrade;
