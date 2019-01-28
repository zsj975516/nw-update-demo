const path = require('path')
module.exports = class extends think.Controller {
    indexAction () {
        const filename = this.get('filename');
        let _path = path.resolve(think.ROOT_PATH, '../client/releases/', decodeURIComponent(filename))
        this.download(_path);
    }
};
