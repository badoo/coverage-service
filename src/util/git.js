const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

function clone(cwd, done) {
    const proc = spawn('git', ['clone', '--progress', process.env.REPO, 'repo'], {
        cwd
    });
    done(proc);
}

function checkout(cwd, hash, done) {
    const branch = process.env.REPO_BRANCH;

    execFile('git', ['checkout', branch], { cwd }, (err1) => {
        if (err1) {
            return done(err1, null);
        }
        execFile('git', ['pull', 'origin', branch], { cwd }, (err2) => {
            if (err2) {
                return done(err2, null);
            }
            execFile('git', ['checkout', hash], { cwd }, (err3, stdout) => {
                done(err3, stdout);
            });
        });
    });
}

module.exports = {
    clone,
    checkout
};
