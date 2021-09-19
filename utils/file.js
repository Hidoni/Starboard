const path = require('path');

module.exports = {
    getRelativePathname: (filename) => path.relative(process.cwd(), filename),
};
