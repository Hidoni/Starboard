const path = require('path');

module.exports = {
    getRelativePathname: (filename: string) => path.relative(process.cwd(), filename),
};
