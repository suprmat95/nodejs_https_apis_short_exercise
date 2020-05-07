var express = require("express")
var bodyParser = require('body-parser');
var superagent = require('superagent');

var app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const PORT = 1234;
function postData(username, token, results, res) {
                var json = {
                     "streamId": "a",
                     "type": "exercise-1/streams",
                     "content": [results]
                };
             //   console.log('POST:\n');
             //   console.log(results)
                superagent.agent()
                    .post('https://'+username + ".pryv.me/events?auth="+token)
                    .send(json)
                    .set('Content-Type', 'application/json')
                    .set('Content-Length', JSON.stringify(json).length)
                    .end((error, resp) => {
                      //  console.log(resp);
                        if(error)
                            res.send(error);
                        res.statusCode = resp.status;
                        res.send(resp.text);
                    });
}
function intersection(a, b)
{

    if(a.id !== b.id)
        return {};
    const obj = {};
    obj.id = a.id;
    obj.parentId = a.parentId;
    obj.children = [];
    let c;
    a.children.forEach(e1 =>{
        b.children.forEach(e2 => {
            c = intersection(e1, e2);
            if(!isEmptyObject(c))
                obj.children.push(c);
        });
    });
    return obj;
}

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

function getData(username, token, result) {
    // Setting URL and headers for request
    // Return new promise
    return new Promise(function(resolve, reject) {
        // Do async job
        superagent.agent().get('https://'+username + ".pryv.me/streams?auth="+token)
           // .auth(username, token,{type:'auto'})
            .type('json')
            .accept('json')
            .end((error, res) => {

                if (!isEmptyObject(result)){
                   // console.log('RES22');
                   // console.log(res);
                   // console.log('RESULT');
                   // console.log(result);
                   // console.log('INTERSECTION');
                    res = intersection(JSON.parse(result).streams[0],JSON.parse(res.text).streams[0]);
                   // console.log(res);

                    return  error ? reject(error) : resolve(res);
                }
                //result=result + res.text;
               return  error ? reject(error) : resolve(res.text);
            });

    })
}


app.listen(PORT, (err) => {
    if (err) console.error(' Unable to connect the server: ', err);
  //  console.log("Listening on port " + PORT);
});

 app.post('/data', function (req, res) {

    // console.log(req);
    var sourceUsername = req.body.source.username;
    var sourceToken = req.body.source.token;
    var backupUsername = req.body.backup.username;
    var backupToken = req.body.backup.token;

    var promise = getData(sourceUsername, sourceToken, {});

     promise.then(function(result) {
        // console.log(' promise');
        // console.log(result)
         return getData(backupUsername, backupToken, result)
     }).then(function(result) {
         return postData(backupUsername, backupToken, result, res)
     }).catch(err => { console.log(err)})


});
 module.exports = app;


