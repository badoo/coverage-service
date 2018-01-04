const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

function clone(cwd, done) {
    const proc = spawn('git', ['clone', '--progress', process.env.REPO, 'repo'], {
        cwd
    });
    done(proc);
}

function checkout(cwd, hash, done) {
    const cmd = `git checkout ${process.env.REPO_BRANCH} && git pull origin ${process.env.REPO_BRANCH} && git checkout ${hash}`;
    exec(cmd, { cwd }, (err, stdout) => {
        done(err, stdout);
    });
}

module.exports = {
    clone,
    checkout
};
