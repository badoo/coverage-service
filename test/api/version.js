const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../../src/app');

const {
    beforeEachSetup,
    afterEachSetup
} = require('../setup');

beforeEach(beforeEachSetup);
afterEach(afterEachSetup);

describe('POST /api/version', () => {

    it('should return error if .gitHash key missing', done => {
        chai.request(app)
            .post('/api/version')
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(500);
                done();
            });
    });

    it('should write it down and increment sessions counter', done => {
        const payload = {
            gitHash: 'foo'
        };
        chai.request(app)
            .post('/api/version')
            .send(payload)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.deep.equal(payload);
                done();
            });
    });

    xit('should write it down and increment sessions counter', done => {
        done();
    });
});

describe('GET /api/version/:hash', () => {

    it('should return error if :hash not found', done => {
        chai.request(app)
            .get('/api/version/foo')
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should get version info if exists', done => {
        const expected = {
            gitHash: 'barbaz'
        };
        chai.request(app)
            .get('/api/version/barbaz')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.deep.equal(expected);
                done();
            });
    });
});
