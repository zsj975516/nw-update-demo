process.env.NODE_ENV = 'production';
const chalk = require('chalk');
const win_build = require('./build-win-setup');
const upgrade = require('./build-upgrade');

(async () => {
  try {
    console.time("本次打包时间（单位：ms）");

    console.log(chalk.cyan('  开始构建Windows安装程序...\n'));
    await win_build.build(true);
    console.log(chalk.cyan('  Windows安装程序构建完成.\n'));

    await upgrade.write();
    console.timeEnd("本次打包时间（单位：ms）");
  } catch (e) {
    console.error(e)
  }
})();
