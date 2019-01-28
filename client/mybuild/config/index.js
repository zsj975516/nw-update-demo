const path = require('path');
const fs = require('fs');
const cmd = require('../util/CMD');

// 输出目录
let outputDir = __dirname;
//let outputDir = path.resolve('E:\\Users\\Desktop\\test\\BUILD');

if (!fs.existsSync(outputDir)) {
  cmd.open(__filename);
  console.error(`输出目录（${outputDir}）不存在，请重新设置`);
  process.exit(1);
}

// 项目 package.json
const proPackage = require(path.resolve(__dirname, '../../package.json'));

if (outputDir === __dirname) {
  outputDir = path.resolve(outputDir, '../../')
}

const buildPath = path.join(outputDir, 'releases', proPackage.name + '-v' + proPackage.version);

const vuePath = path.join(__dirname, '../../app/renderer');

const config = {
  buildPath: buildPath,
  proPackage: proPackage,
  template: path.join(vuePath, 'index.ejs'),
  assetsRoot: path.join(outputDir, 'dist'),
  vuePath: vuePath,
  manifest: ['name', 'version', {main: 'index.html'}, 'window', 'chromium-args'],

  nwBuilder: {
    //{String} default null
    files: [path.resolve(outputDir, 'dist/**')],
    //{Array} default ['osx64', 'win32', 'win64']
    //ps： ['win', 'osx', 'linux'] 可用于创建32和64
    platforms: ['win'/*, 'osx', 'linux'*/],
    //{string} default 'latest'
    version: '0.14.7',
    //{String} default 'sdk' sdk用于开发，normal用于生产
    flavor: 'sdk',
    // {String} default false
    appName: proPackage.appName,
    // {String} default false
    appVersion: proPackage.version,
    // {String} default ./cache
    // cacheDir: path.resolve(__dirname,'node_modules/_nw-builder-cache'),
    //{String} default null
    winIco: path.join(__dirname, '../../static/logo.ico'),
    // {String} default false
    macIcns: path.join(__dirname, '../../static/logo.icns'),
    // {String} default ./build
    buildDir: path.join(outputDir, 'releases'),
    // {String or function} default default
    // eg:default [appName]
    //    versioned [appName] -v[appVersion]
    //    timestamped [appName] - [timestamp];
    //    A function with options as scope (e.g function () {return this.appVersion;} )
    buildType: function () {
      return `${proPackage.name}-v${this.appVersion}`;
    },
    // {Boolean} default false 这回删掉所有的文件
    // forceDownload: false,
    //{String} default false 仅mac有效
    // macCredits: false,
    //{Boolean} default null 仅windows有效（感觉linux也有效）
    zip: true,
    // {Object} default null
    // zipOptions:null,
    //{String or Object} default false 仅mac有效
    macPlist: false,
    //{Object } default {} 仅windows有效 如果是在mac或linux上需要安装Wine
    // doc:https://msdn.microsoft.com/en-us/library/windows/desktop/aa381058.aspx#string-name
    winVersionString: {
      //公司
      CompanyName: proPackage.publisher,
      //文件说明
      FileDescription: proPackage.appName + '客户端',
      //文件名称
      ProductName: proPackage.appName + '客户端',
      //文件版本
      FileVersion: proPackage.fileVersion,
      //版权
      LegalCopyright: proPackage.copyright,
    },
  },
  innosetup: {
    ISCC: path.join(__dirname, '../innosetup/ISCC.exe'),
    issPath: path.join(__dirname, '../innosetup_src/template.iss'),
    LicenseFile: path.join(__dirname, '../innosetup_src/license.txt'),
    SetupIconFile: path.join(__dirname, '../../static/logo.ico'),
    expectDir: ['win32', 'win64'/*, 'osx32', 'osx64', 'linux32', 'linux64'*/],//期望打包的文件夹
    outputFileName: function (platform) {
      return `${proPackage.appName}-v${proPackage.version}-x${platform}`;
    }
  },
  upgrade: {
    outputFile: path.join(outputDir, 'releases/latest.yml')
  }
};
module.exports = config;
