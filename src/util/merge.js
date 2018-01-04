const fs = require('fs');
const path = require('path');
const libCoverage = require('nyc/node_modules/istanbul-lib-coverage');

const MAX_BATCH = 10;

function merge(dir, files) {
    let merged;
    files.forEach(file => {
        const filepath = path.resolve(dir, file);
        const content = read(filepath);
        if (!content) return;

        const map = libCoverage.createCoverageMap(content);
        if (!merged) {
            merged = map;
        } else {
            merged.merge(map);
        }
        remove(filepath);
    });

    const output = path.join(dir, `out${new Date().getTime()}.json`);
    if (merged) {
        fs.writeFileSync(output, JSON.stringify(merged.toJSON()));
    }
}

function read(filepath) {
    let coverage;
    try {
        coverage = fs.readFileSync(filepath, 'utf8');
        if (coverage) {
            coverage = JSON.parse(coverage);
        } else {
            remove(filepath);
        }
    } catch (e) {
        remove(filepath);
        coverage = null;
    }
    return coverage;
}

function remove(filepath) {
    try {
        fs.unlinkSync(filepath);
    } catch (e) {
        console.error(`Error deleting ${filepath}`);
    }
}

function reduce(dir) {
    fs.readdir(dir, (err, list) => {
        if (err) return console.error(err);
        if (list.length <= 1) {
            return;
        }

        console.log(`${list.length} files found. Merging...`);
        merge(dir, list.sort().slice(0, MAX_BATCH));
        setTimeout(() => reduce(dir));
    });
}

module.exports = {
    reduce
};
