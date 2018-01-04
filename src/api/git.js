const router = require('express').Router();
const fs = require('fs');
const rmrf = require('rimraf');

const git = require('../util/git');

router.post('', (req, res) => {
    if (fs.existsSync(process.env.REPO_DIR)) {
        return res.status(409).send('Repository already cloned');
    }

    git.clone(process.env.DATA_DIR, (proc) => {
        proc.stdout.pipe(res);
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(res);
        proc.stderr.pipe(process.stderr);
    });
});

router.delete('', (req, res) => {
    if (!fs.existsSync(process.env.REPO_DIR)) {
        return res.status(404).send('Repository not found');
    }

    rmrf(process.env.REPO_DIR, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err.toString());
        }

        res.sendStatus(200);
    });
});

module.exports = router;
