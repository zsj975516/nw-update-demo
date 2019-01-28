// require('babel-core/register');

const path = require('path');
const CMD = require('../util/CMD');

const fromPreCopyFile = path.resolve(__dirname, '../../app/CA');

module.exports = async function copyFile(toPath) {
  let copyPreCopyFile = `xcopy "${fromPreCopyFile}" "${toPath}" /e /y`;
  console.log('开始复制 CA 文件夹：', copyPreCopyFile);
  await  CMD.exec(copyPreCopyFile);
  console.log(`    CA 文件夹复制完成`);

};
