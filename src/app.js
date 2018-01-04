const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const PAYLOAD_LIMIT = process.env.PAYLOAD_LIMIT || '50MB';

// Default service parameters
if (!process.env.DATA_DIR) {
    process.env.DATA_DIR = path.resolve('./data');
    process.env.REPO_DIR = `${process.env.DATA_DIR}/repo`;
}
if (!process.env.REPO) {
    process.env.REPO = 'git@git.url:repo.git';
}
if (!process.env.REPO_BRANCH) {
    process.env.REPO_BRANCH = 'master';
}

const app = express();

app.use(bodyParser.json({
    limit: PAYLOAD_LIMIT
}));
app.use(
    bodyParser.urlencoded({
        extended: false,
        limit: PAYLOAD_LIMIT
    })
);

app.use('', express.static('public'));
app.use('/html', express.static('data/html'));

app.use('/api/info', require('./api/info'));
app.use('/api/version', require('./api/version'));
app.use('/api/coverage', require('./api/coverage'));
app.use('/api/git', require('./api/git'));

module.exports = app;
