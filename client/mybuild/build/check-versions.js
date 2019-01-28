/**
 * 版本检查模块
 * 1、node
 * 2、npm
 */
const chalk = require('chalk');
const semver = require('semver');
const packageConfig = require('../../package.json');

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}

let versionRequirements = [
  {
    name: 'node',// node版本的信息
    currentVersion: semver.clean(process.version),// 使用semver插件吧版本信息转化成规定格式，也就是 '  =v1.2.3  ' -> '1.2.3' 这种功能
    versionRequirement: packageConfig.engines.node// 这是规定的pakage.json中engines选项的node版本信息 "node":">= 4.0.0"
  },
  {
    name: 'npm',
    currentVersion: exec('npm --version'), // 自动调用npm --version命令，并且把参数返回给exec函数，从而获取纯净的版本号
    versionRequirement: packageConfig.engines.npm // 这是规定的pakage.json中engines选项的node版本信息 "npm": ">= 3.0.0"
  }
];

module.exports = function () {
  let warnings = [];
  for (let i = 0; i < versionRequirements.length; i++) {
    let mod = versionRequirements[i];
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': 当前版本(' +
        chalk.red(mod.currentVersion) + ') 目标版本(' +
        chalk.green(mod.versionRequirement)+')'
      );
    }
  }

  if (warnings.length) {
    console.log('');
    console.log(chalk.yellow('使用此模板，你应该升级以下模块:'));
    console.log();
    for (let i = 0; i < warnings.length; i++) {
      let warning = warnings[i];
      console.log('  ' + warning);
    }
    console.log();
    process.exit(1);
  }
};
