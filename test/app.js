const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../src/app');

describe('Coverage service', () => {

    it('should be defined', () => {
        expect(app).to.not.be.undefined;
    });

    it('should serve HTML home page', done => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.type).to.be.equal('text/html');
                expect(res.text.includes('<title>Autotests coverage</title>')).to.be.true;
                done();
            });
    });
});
