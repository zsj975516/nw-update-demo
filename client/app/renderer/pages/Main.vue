<template>
  <div class="hello">
    当前版本：{{version}}
    <button @click="checkForUpdates">检查更新</button>
    <button @click="toggleDevTools">打开/关闭开发者工具</button>
    <input v-model="urltext">
    <button @click="openInIE">使用IE打开</button>
    <div class="update-box" v-if="updateStep!==-2">
      <div class="inner-box">
        <div @click="closeUpdateBox" class="close-btn">x</div>
        <div class="update-msg">{{updateMsg[updateStep+1]}}</div>
        <div class="progress-bar" v-if="updateStep===3||updateStep===5">
          <div class="progress-text">{{progress+'%'}}</div>
          <div class="progress" :style="{width:progress+'%'}"></div>
        </div>
        <div class="version" v-if="updateStep===1">V{{newVersion}}</div>
        <div class="btn-box">
          <button @click="downloadUpdate" v-if="updateStep === 1">下载更新</button>
          <button @click="rebootNow" v-if="updateStep === 4">立即安装</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {App} from 'nw.gui'

  const exec = require('child_process').execSync
  const updater = require('../utils/nw-update')
  let res = exec('REG QUERY HKEY_CLASSES_ROOT\\zhgszs\\shell\\open\\command /v UPDATEADDRESS')
  res = res.toString().replace(/\s/g, '')
  let ip = res.substr(res.indexOf('REG_SZ') + 'REG_SZ'.length)
  updater.setFeedURL(`http://${ip}/download`)
  const {manifest} = App

  export default {
    name: 'landing-page',
    data () {
      return {
        updateMsg: ['错误', '检查更新中', '发现新版本，是否下载？', '恭喜，您的软件已是最新版本', '软件正在下载中...', '更新下载完成，是否立即安装'],
        updateStep: -2,
        newVersion: '0.0.0',
        progress: 0,
        downloadProgress: 0,
        showConfirmUpdate: false,
        rManifest: '',
        updateFile: '',
        urltext: '',
      }
    },
    computed: {
      version () {
        return manifest.version
      }
    },
    async created () {
    },
    mounted () {
      updater.on('error', e => {
        this.updateStep = -1
        console.error(e)
      })
      updater.on('checking-for-update', () => {
        this.updateStep = 0
      })
      updater.on('update-available', (info) => {
        this.updateStep = 1
        this.newVersion = info.version
      })
      updater.on('update-not-available', (info) => {
        console.log(info)
        this.updateStep = 2
      })
      updater.on('download-progress', (progress) => {
        this.updateStep = 3
        this.progress = Math.floor(progress.loaded / progress.total * 100)
      })
      updater.on('update-downloaded', () => {
        this.updateStep = 4
        this.progress = 0
      })
      updater.on('install-progress', (progress) => {
        this.updateStep = 3
        this.progress = Math.floor(progress.loaded / progress.total * 100)
      })
      updater.on('install-end', () => {
        this.updateStep = 4
      })
    },
    methods: {
      async checkForUpdates () {
        updater.checkForUpdates()
      },
      toggleDevTools () {
      },
      openInIE () {
        window.open(`openIE:${this.urltext}`)
      },
      async rebootNow () {
        // 重启
        updater.quitAndInstall()
      },
      closeUpdateBox () {
        this.updateStep = -2
      },
      async downloadUpdate () {
        updater.downloadUpdate()
      }
    }
  }
</script>

<style scoped lang="scss">

  .hello {
    background: radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
    );
    height: 100vh;
    width: 100vw;

    .update-box {
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.2);
      height: 100%;
      width: 100%;

      .inner-box {
        height: 75%;
        width: 75%;
        background-color: white;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          text-align: center;
          width: 30px;
          height: 30px;
          line-height: 30px;
          cursor: default;
          user-select: none;
          font-size: 24px;
          font-family: Consolas;

          &:hover {
            background-color: red;
            color: white;
          }
        }

        .update-msg {
          position: absolute;
          text-align: center;
          font-size: 24px;
          top: 40px;
          width: 100%;
        }

        .progress-bar {
          height: 30px;
          position: absolute;
          top: 120px;
          left: 0;
          right: 0;
          width: 80%;
          margin: 0 auto;
          border-radius: 15px;
          overflow: hidden;
          border: 1px solid #ccc;

          .progress-text {
            position: absolute;
            width: 100%;
            text-align: center;
            line-height: 30px;
          }

          .progress {
            height: 100%;
            background-color: #c3d9ff;
          }
        }

        .version {
          position: absolute;
          top: 120px;
          font-size: 30px;
          text-align: center;
          width: 100%;
        }

        .btn-box {
          text-align: center;
          position: absolute;
          width: 100%;
          bottom: 40px;

          button {
            font-size: 16px;
            padding: 3px 20px;
            border: 1px solid #ccc;
            outline: none;
            border-radius: 3px;
            margin-left: 20px;

            &:hover {
              background-color: #c3d9ff;
            }

            &:nth-child(1) {
              margin-left: 0;
            }
          }
        }
      }
    }

  }

</style>
