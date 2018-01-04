const router = require('express').Router();
const fs = require('fs');

const git = require('../util/git');
const nyc = require('../util/nyc');
const merge = require('../util/merge');

router.post('/:hash', (req, res) => {
    if (!req.params.hash) {
        return error(new Error('No hash to write coverage for'), res);
    }

    const coverage = nyc.updatePaths(req.params.hash, req.body);
    nyc.write(req.params.hash, coverage, (err, dir) => {
        if (err) return error(err, res);

        setTimeout(() => merge.reduce(dir));
        return res.json({
            'content-length': parseInt(req.headers['content-length'], 10)
        });
    });
});

router.get('/:hash', (req, res) => {
    nyc.exists(req.params.hash, (err) => {
        if (err && err.code === 'ENOENT') {
            return res.status(404).send('Coverage not found');
        }
        if (err) return error(err, res);

        nyc.report(req.params.hash, (err, data) => {
            if (err) return error(err, res);

            return res.status(200).type('text').send(data);
        });
    });
});

router.get('/html/:hash', (req, res) => {
    nyc.exists(req.params.hash, (err) => {
        if (err && err.code === 'ENOENT') {
            return res.status(404).send('Coverage not found');
        }
        if (err) return error(err, res);

        if (!fs.existsSync(process.env.REPO_DIR)) {
            return res.status(404).send('Repository not cloned');
        }

        git.checkout(process.env.REPO_DIR, req.params.hash, (err) => {
            if (err) return error(err, res);

            nyc.reportHtml(req.params.hash, (err, reportPath) => {
                if (err) return error(err, res);

                nyc.moveHtml(reportPath, req.params.hash, (err, urlPath) => {
                    if (err) return error(err, res);

                    return res.redirect(urlPath);
                });
            });
        });
    });
});

function error(err, res) {
    console.error(err);
    return res.status(500).send(err.toString());
}

module.exports = router;
