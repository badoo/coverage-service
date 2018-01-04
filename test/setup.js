const path = require('path');
const rmrf = require('rimraf');
const mkdirp = require('mkdirp');
const cpdir = require('ncp');

const dataDir = path.join(__dirname, 'data');
const coverageDir = path.join(__dirname, 'data', 'coverage');
const mockDir = path.join(__dirname, 'mock');

// DATA_DIR setup
// Copy ./test/mock to ./test/data/coverage

function beforeEachSetup(done) {
    process.env.DATA_DIR = dataDir;
    mkdirp(coverageDir, err => {
        if (err) return done(err);

        cpdir(mockDir, coverageDir, done);
    });
}

function afterEachSetup(done) {
    delete process.env.DATA_DIR;
    rmrf(coverageDir, done);
}

module.exports = {
    beforeEachSetup,
    afterEachSetup
};
