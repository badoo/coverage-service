const router = require('express').Router();

const nyc = require('../util/nyc');

router.post('', (req, res) => {
    const version = req.body;
    if (!version || !version.gitHash) {
        return error(new Error('No data'), res);
    }

    nyc.write(version.gitHash, version, (err) => {
        if (err) return error(err, res);

        nyc.incrementSessions(version.gitHash);
        return res.json(req.body);
    });
});

router.get('/:hash', (req, res) => {
    nyc.exists(req.params.hash, (err, data) => {
        if (err && err.code === 'ENOENT') {
            return res.status(404).send('Not found');
        }
        if (err) return error(err, res);

        return res.json(JSON.parse(data));
    });
});

function error(err, res) {
    console.error(err);
    return res.status(500).send(err.toString());
}

module.exports = router;
