const chai = require('chai');
const chaiHttp = require('chai-http');
const index =  require('../../index')
const should = chai.should();
chai.use(chaiHttp);
const expect = chai.expect;
describe('Post', function ()  {
    it('Testing post', function (done) {
        chai.request(index)
            .post('/data')
            .send({
                source: {
                    username: "sw-interview-source",
                    token: "ck5h1u3o200j21hd39ymop3vj"
                },
                backup: {
                    username: "sw-interview-backup",
                    token: "ck5h1b5mw00jf1fd3s6e0vhie"
                }
            })
            .end((err, res) => {
             //   console.log('Error: ' + err); // outputs null
                console.log('Text ' + res.text); // outputs normal-looking response
                expect(res).to.have.status(201);
                expect(res.type,'application/json');
                done();
            });

    })

})
