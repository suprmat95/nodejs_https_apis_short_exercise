const expect = require('chai');
const index =  require('../../index')
var request = require('supertest');

describe('Post', function () {
    it('Testing post', function (done) {
        request(index).post('/data')
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
            .expect(200,done)

    })
    
});
