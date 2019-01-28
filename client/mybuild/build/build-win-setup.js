const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');//编码转换
const cmd = require('../util/CMD');
const config = require('../config');

async function build (isDelNw = false) {
  try {
    const res = [];
    //获取要打包的文件夹
    const dirs = fs.readdirSync(config.buildPath);

    dirs.forEach(function (dirName) {
      // 判断该文件夹是否需要打包 !~-1 ==> true
      if (!~config.innosetup.expectDir.indexOf(dirName)) return;

      const curPath = path.resolve(config.buildPath, dirName);
      //如果不是文件夹，则进行下一次循环
      if (!fs.statSync(curPath).isDirectory()) return;

      let platform = /64/.test(dirName) ? 64 : 32;
      const options = {
        outputFileName: config.innosetup.outputFileName(platform),
        files: curPath,
        outputPath: path.join(config.buildPath, `../`),
        platform: dirName
      };
      res.push(makeExeSetup(options));
    });
    await Promise.all(res);
    if (isDelNw) await cmd.deleteDirAndFile(config.buildPath)
  } catch (e) {
    throw e
  }
}

/**
 * 使用inno-setup打包exe文件
 * @param opt
 */
function makeExeSetup (opt) {
  const {files, outputFileName, outputPath, platform} = opt;
  const tempIssPath = path.resolve(path.parse(config.innosetup.issPath).dir, '_temp_' + platform + '.iss');
  return new Promise(async function (resolve) {
    try {
      // exe文件的配置
      let cfg = {};
      cfg.EnglishName = config.proPackage.name;
      cfg.AppName = config.nwBuilder.appName;
      cfg.AppVersion = config.proPackage.version;
      cfg.AppPublisher = config.proPackage.publisher;
      // cfg.AppURL = config.proPackage.appURL;
      cfg.AppExeName = config.nwBuilder.appName + '.exe';
      cfg.AppId = config.proPackage.appId;
      cfg.OutputDir = outputPath;
      cfg.AppExePath = files;
      cfg.FilesPath = files;
      cfg.Platform = platform;
      // cfg.FileVersion = config.proPackage.fileVersion;
      cfg.Copyright = config.proPackage.copyright;
      // cfg.OutputBaseFilename = outputFileName;//不带exe
      cfg.LicenseFile = config.innosetup.LicenseFile;
      cfg.SetupIconFile = config.innosetup.SetupIconFile;

      let text = fs.readFileSync(config.innosetup.issPath).toString();

      text = text.replace(/\$(.+)\$/g, function (word) {
        return cfg[word.replace(/\$/g, '')]
      });

      fs.writeFileSync(tempIssPath, iconv.encode(text, 'gbk'));
      await cmd.exec(config.innosetup.ISCC + ' ' + tempIssPath);
      await cmd.deleteFile(tempIssPath);
    } catch (e) {
      throw e;
    }
    resolve();
  })
}

module.exports.build = build;
