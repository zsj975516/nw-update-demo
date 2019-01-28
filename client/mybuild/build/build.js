process.env.NODE_ENV = 'production';
const chalk = require('chalk');

const config = require('../config');
const cmd = require('../util/CMD');
// const fs = require('fs');
// const path = require('path');

const vue_build = require('./build-vue');
const nw_build = require('./build-nw');
const win_build = require('./build-win-setup');
const upgrade = require('./build-upgrade');
// const copyFile = require('./copyfile');

(async () => {
  const isPubilsh = /pubilsh/i.test(process.argv[2])
  try {
    console.time("本次打包时间（单位：ms）");

    await cmd.deleteDirAndFile(config.buildPath);
    await cmd.deleteDirAndFile(config.assetsRoot);

    // let now = new Date().toLocaleTimeString().replace(/[:]/g, '');
    // config.proPackage.fileVersion = `${config.proPackage.version}.${now.substr(0, 4)}`;
    // fs.writeFileSync(path.resolve(__dirname, '../../package.json'), JSON.stringify(config.proPackage, null, 2), 'utf-8');

    console.log(chalk.cyan('  开始构建VUE...\n'));
    await vue_build.build();
    console.log(chalk.cyan('  VUE构建完成.\n'));

    console.log(chalk.cyan('  开始构建NW...\n'));
    await nw_build.build();
    console.log(chalk.cyan('  NW构建完成.\n'));

    console.log(chalk.cyan('  开始构建Windows安装程序...\n'));
    await win_build.build(true);
    console.log(chalk.cyan('  Windows安装程序构建完成.\n'));

    if (isPubilsh) await upgrade.write();
    console.timeEnd("本次打包时间（单位：ms）");
  } catch (e) {
    console.error(e)
  }
})();
