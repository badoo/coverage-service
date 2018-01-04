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

describe('POST /api/coverage/:hash', () => {

    it('should respond with error if :hash parameter missing', done => {
        chai.request(app)
            .post('/api/coverage')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.error).to.be.a('Error');
                done();
            });
    });

    it('should accept JSON object payload and respond with object length', done => {
        const expected = {
            'content-length': 2
        };
        chai.request(app)
            .post('/api/coverage/foo')
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.deep.equal(expected);
                done();
            });
    });
});

describe('GET /api/coverage/:hash', () => {

    it('should respond with error if :hash parameter missing', done => {
        chai.request(app)
            .get('/api/coverage')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.error).to.be.a('Error');
                done();
            });
    });

    it('should respond with error if :hash not found', done => {
        chai.request(app)
            .get('/api/coverage/foo')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.error).to.be.a('Error');
                done();
            });
    });

    it('should respond with error if no coverage data available', done => {
        chai.request(app)
            .get('/api/coverage/foobar')
            .end((err, res) => {
                expect(res).to.have.status(500);
                done();
            });
    });

    xit('should respond with plain text coverage', done => {
        done();
    });
});

describe('GET /api/coverage/html/:hash', () => {

    xit('should checkout git version and get HTML report if exists', done => {
        done();
    });
});
