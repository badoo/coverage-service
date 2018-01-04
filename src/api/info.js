const router = require('express').Router();
const cmp = require('semver-compare');
const fs = require('fs');
const path = require('path');

const nyc = require('../util/nyc');

router.get('', (req, res) => {
    const COVERAGE_DIR = path.join(process.env.DATA_DIR, 'coverage');
    getVersions((err, list) => {
        if (err) return error(err, res);

        const output = list.reduce((out, item) => {
            // Get sessions
            const sessionsFile = path.join(COVERAGE_DIR, item.gitHash, 'sessions');
            const sessions = fs.existsSync(sessionsFile) ? parseInt(fs.readFileSync(sessionsFile, 'utf8'), 10) : 0;

            // Posted coverage files
            const coveragesDir = path.join(COVERAGE_DIR, item.gitHash, '.nyc_output');
            let coverages = [];
            if (fs.existsSync(coveragesDir) && fs.statSync(coveragesDir).isDirectory()) {
                coverages = fs.readdirSync(coveragesDir).map((cov) => {
                    const stats = fs.statSync(path.join(COVERAGE_DIR, item.gitHash, '.nyc_output', cov));
                    return {
                        fname: cov,
                        mtime: stats.mtime,
                        size: stats.size
                    };
                });
            }

            // Info about sessions and uploaded coverages
            item.sessionCnt = sessions;
            item.size = coverages.reduce((size, session) => {
                return size + session.size;
            }, 0);
            item.sizeDisplay = displaySize(item.size);
            item.updated = coverages.reduce((date, session) => {
                return session.mtime > date ? session.mtime : date;
            }, '');
            out.push(item);
            return out;
        }, []).map((item, ndx) => {
            // Append no
            item.no = ndx + 1;
            return item;
        }).reverse();

        return res.json(output);
    });
});

router.get('/progress', (req, res) => {
    getVersions((err, list) => {
        if (err) return error(err, res);
        if (!list.length) return res.json([]);

        const result = [];
        function coverage(ndx) {
            return done => {
                nyc.report(list[ndx].gitHash, (err, data) => {
                    if (!err) {
                        result.push({
                            gitHash: list[ndx].gitHash,
                            lines: data.split('\n').slice(0, 4)
                        });
                    }
                    if (typeof list[ndx + 1] !== 'undefined') {
                        return coverage(ndx + 1)(done);
                    }
                    done(result);
                });
            };
        }
        coverage(0)(() => res.json(format(result).reverse()));
    });
});

function getVersions(done) {
    const COVERAGE_DIR = path.join(process.env.DATA_DIR, 'coverage');
    fs.readdir(COVERAGE_DIR, (err, list) => {
        if (err) return done(err);

        // Get for all directories
        const versions = list.filter(hash => {
            const stats = fs.statSync(path.join(COVERAGE_DIR, hash));
            return stats.isDirectory();
        }).map(hash => {
            // Read version.json
            const versionFile = path.join(COVERAGE_DIR, hash, 'version.json');
            if (!fs.existsSync(versionFile)) {
                return;
            }

            const version = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
            return version;
        }).filter(Boolean).sort((a, b) => {
            // Sort by version, build
            if (a.version !== b.version) {
                return cmp(a.version, b.version);
            }
            return (a.build > b.build) ? 1 : -1;
        });

        done(null, versions);
    });
}

// Format first several lines of each plain text coverage output
function format(result) {
    result.forEach((item, ndx) => {
        const headers = item.lines[1].split('|').map(item => item.replace('%', '').trim()).slice(1, 5);
        const values = item.lines[3].split('|').map(item => item.trim()).slice(1, 5).map(item => parseFloat(item));
        result[ndx] = {
            gitHash: item.gitHash
        };
        headers.forEach((key, i) => {
            const value = values[i];
            const diff = ndx === 0 ? 0 : value - result[ndx - 1][key].value;
            result[ndx][key] = {
                value,
                diff: parseFloat(diff.toFixed(2))
            };
        });
    });
    return result;
}

function displaySize(size) {
    if (!size) return '';

    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

function error(err, res) {
    console.error(err);
    return res.status(500).send(err.toString());
}

module.exports = router;
