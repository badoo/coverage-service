const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const mv = require('mv');

const SEARCH_STR = 'MW-';

// Cached plain text report - get it cached if
// 1. there is `lcov.txt` file already generated, and
// 2. it is newer than its `.nyc_output` folder
function report(hash, done) {
    const txtFile = path.join(coverageDir(), hash, 'lcov.txt');
    const nycFolder = path.join(coverageDir(), hash, '.nyc_output');
    if (!fs.existsSync(txtFile) || !fs.existsSync(nycFolder)) {
        return reportPlain(hash, done);
    }

    const txtStats = fs.statSync(txtFile);
    const folderStats = fs.statSync(nycFolder);
    if (folderStats.mtime > txtStats.mtime) {
        return reportPlain(hash, done);
    }

    done(null, fs.readFileSync(txtFile, 'utf8'));
}

function reportPlain(hash, done) {
    symlink(hash, (err) => {
        if (err) return done(err);

        const cwd = path.join(coverageDir(), hash);
        exec('nyc report', { cwd }, (err, stdout, stderr) => {
            if (!err && !stderr) {
                fs.writeFileSync(path.join(cwd, 'lcov.txt'), stdout);
            }
            done(err || stderr, stdout);
        });
    });
}

function reportHtml(hash, done) {
    symlink(hash, (err) => {
        if (err) return done(err);

        const cwd = path.join(coverageDir(), hash);
        exec('nyc --all report --reporter=html', { cwd }, (err, stdout, stderr) => {
            done(err || stderr, `${cwd}/coverage`);
        });
    });
}

// Move generated HTML report to public folder
function moveHtml(reportPath, hash, done) {
    const urlPath = `/html/${hash}`;
    const destPath = path.join(process.env.DATA_DIR, urlPath);
    rmrf(destPath, (err) => {
        if (err) return done(err);

        mv(reportPath, destPath, { mkdirp: true }, (err) => {
            if (err) return done(err);

            done(null, urlPath);
        });
    });
}

// Symlink .nyc_output folder in parent DATA_DIR
// as nyc requires it to generate proper report
function symlink(hash, done) {
    const target = `coverage/${hash}/.nyc_output`;
    const link = path.join(process.env.DATA_DIR, '.nyc_output');
    if (fs.existsSync(link)) {
        fs.unlinkSync(link);
    }
    fs.symlink(target, link, 'dir', done);
}

// Update file paths in object from "*SEARCH_STR*/frontend/platform/public/js/..."
// to "REPO_DIR/frontend/platform/public/js/..."
function updatePaths(hash, object) {
    const REPO_DIR = path.join(process.env.DATA_DIR, 'repo');
    function update(path) {
        const pos1 = path.indexOf(SEARCH_STR);
        if (pos1 === -1) {
            return path;
        }
        const pos2 = path.substr(pos1).indexOf('/');
        return REPO_DIR + path.substr(pos1).substr(pos2);
    }
    return Object.keys(object).reduce((memo, key) => {
        const val = object[key];
        val['path'] = update(val['path']);
        memo[update(key)] = val;
        return memo;
    }, {});
}

// Write window.__coverage__ or version.json object to disk
function write(hash, object, done) {
    if (!hash) {
        return done('Cannot write with empty hash');
    }

    let dir = path.join(coverageDir(), hash, '.nyc_output');
    let filename = `${new Date().getTime()}.json`;
    if (object.build && object.version && object.gitHash) { // version.json
        dir = path.join(coverageDir(), object.gitHash);
        filename = 'version.json';
    }
    mkdirp(dir, (err) => {
        if (err) {
            return done(err);
        }

        const filepath = path.join(dir, filename);
        if (fs.existsSync(filepath)) {
            console.warn(`${filepath} already exists`);
            return done(null, dir);
        }

        fs.writeFile(filepath, JSON.stringify(object), 'utf8', (err) => {
            if (err) {
                return done(err);
            }

            done(null, dir);
        });
    });
}

// Increment number in a `sessions` file
function incrementSessions(hash) {
    const filepath = path.join(coverageDir(), hash, 'sessions');
    let sessions = 0;
    if (fs.existsSync(filepath)) {
        sessions = parseInt(fs.readFileSync(filepath, 'utf8'), 10);
    }
    fs.writeFileSync(filepath, sessions + 1);
}

// Does this hash exist on disk
function exists(hash, done) {
    fs.readFile(path.join(coverageDir(), hash, 'version.json'), 'utf8', done);
}

function coverageDir() {
    return path.join(process.env.DATA_DIR, 'coverage');
}

module.exports = {
    report,
    reportHtml,
    moveHtml,
    updatePaths,
    write,
    incrementSessions,
    exists
};
