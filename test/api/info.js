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

describe('GET /api/info', () => {

    it('should return info array', done => {
        const expected = [{
            gitHash: 'foobar',
            sessionCnt: 5,
            size: 0,
            sizeDisplay: '',
            updated: '',
            no: 2
        }, {
            gitHash: 'barbaz',
            sessionCnt: 0,
            size: 0,
            sizeDisplay: '',
            updated: '',
            no: 1
        }];
        chai.request(app)
            .get('/api/info')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.type).to.be.equal('application/json');
                expect(res.body).to.be.deep.equal(expected);
                done();
            });
    });
});

describe('GET /api/info/progress', () => {

    it('should return empty array if data not present', done => {
        chai.request(app)
            .get('/api/info/progress')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.type).to.be.equal('application/json');
                expect(res.body).to.be.deep.equal([]);
                done();
            });
    });
});
