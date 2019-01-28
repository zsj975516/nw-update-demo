const EventEmitter = require('events'),
  semver = require('semver'),
  os = require('os')

const IS_OSX = /^darwin/.test(process.platform)
const IS_WIN = /^win/.test(process.platform)
const PLATFORM_SHORT = (IS_WIN ? 'win' : (IS_OSX ? 'mac' : 'linux'))
const PLATFORM_FULL = PLATFORM_SHORT + (process.arch === 'ia32' ? '32' : '64')

const YAML = require('yamljs')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const url = require('url')
const crypto = require('crypto')
const rimraf = require('rimraf')

const axios = require('axios')

axios.interceptors.response.use((response) => {
  return response.data
}, (error) => {
  return Promise.reject(error)
})

function request (url, param = {}) {
  return axios.request({
    url: url,
    method: 'get',
    params: param
  })
}

const rm = (p) => {
  return new Promise((resolve, reject) => {
    rimraf(p, () => {
      resolve()
    })
  })
}

class AutoUpdater extends EventEmitter {
  constructor () {
    super()
    this.autoDownload = false
    this.feedURL = ''
    this.currentVersion = nw.App.manifest.version
    this.updateInfo = {}
    this.release = ''
    this.updateFile = ''
  }

  setFeedURL (url) {
    this.feedURL = url
  }

  async checkForUpdates () {
    this.emit('checking-for-update')
    if (!this.feedURL) return this.emit('error', new Error('请设置feedURL'))
    try {
      let updateInfo = await request(this.feedURL + '/latest.yml')
      this.updateInfo = YAML.parse(updateInfo)
      this.release = this.updateInfo.files.find(item => item.platform === PLATFORM_FULL)
      console.log(this.updateInfo.version)
      if (semver.gt(this.updateInfo.version, this.currentVersion) && this.release) {
        this.emit('update-available', this.updateInfo)
      } else {
        this.emit('update-not-available', this.updateInfo)
      }
    } catch (e) {
      this.emit('error', e)
    }
  }

  async downloadUpdate () {
    if (!this.release) {
      throw new Error(`没有新版本`)
    }
    let downloadURL = this.feedURL + '/' + encodeURIComponent(this.release.url)
    const filepath = path.resolve(os.tmpdir(), this.release.url)
    if (fs.existsSync(filepath)) {
      let md5 = await getMD5(filepath)
      if (md5 === this.release.md5.toLowerCase()) {
        this.emit('download-progress', {
          total: this.release.size,
          loaded: this.release.size
        })
        this.emit('update-downloaded')
        this.updateFile = filepath
        return
      }
      await rm(filepath)
    }
    const server = url.parse(downloadURL).protocol === 'https:' ? https : http
    let total = 0
    server.get(downloadURL, res => {
      res.on('data', chunk => {
        total += chunk.length
        this.emit('download-progress', {
          total: this.release.size,
          loaded: total
        })
      })
      res.pipe(fs.createWriteStream(filepath))
      res.on('end', () => {
        this.emit('update-downloaded')
        this.updateFile = filepath
      })
      res.on('error', e => this.emit('error', e))
    })
  }

  install () {
    this.quitAndInstall(false)
  }

  async quitAndInstall (restartNow = true) {
    await StartSetup(this.updateFile)
    // nw.App.quit()
  }
}

function StartSetup (updateFile) {
  return new Promise((resolve, reject) => {
    const {exec} = require('child_process')
    const child = exec(`start "" "${updateFile}" /verysilent /suppressmsgboxes /norestart`, {
      timeout: 4000,
      detached: true
    })
    child.on('error', (e) => {
      reject(e)
    })
    // child.unref()
    // setTimeout(resolve, 1000)
  })
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

module.exports = new AutoUpdater()
