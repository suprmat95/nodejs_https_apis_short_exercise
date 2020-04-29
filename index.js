var express = require("express")
var bodyParser = require('body-parser');
const https = require('https');
var app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
var port = 1234;

app.get("/", function(req, res){
    res.send("It works!");
});
var result = ' ';
app.post('/data', function (req, res) {
    var sourceUsername = req.body.source.username;
    var sourceToken = req.body.source.token;
    var backupUsername = req.body.backup.username;
    var backupToken = req.body.backup.token;
    var resp1;
    var resp2;


    var sourceOptions = {
        method: 'GET',
        host: sourceUsername+".pryv.me",
        path: '/streams',
        auth: sourceToken,
    };
    var backupOptions = {
        method: 'GET',
        host: backupUsername+".pryv.me",
        path: '/streams',
        auth: backupToken,
    };

    var sourceStreams;
    var backupStreams;
    console.log('CIAO');
    https.get(sourceOptions, source =>{
        var body = ' ';
        console.log(`statusCode: ${source.statusCode}`);

        source.on('data', d1 => {
            body += d1;
           // process.stdout.write(d1)
        });
        source.on('error', error => {
            console.error(error)
        });
        source.on('end', end =>{
            sourceStreams = JSON.parse(body);
            https.get(backupOptions, backup =>{
                var body = ' ';
                console.log(`statusCode: ${backup.statusCode}`);

                backup.on('data', d1 => {
                    body += d1;
               //     process.stdout.write(d1)
                });
                backup.on('error', error => {
                    console.error(error)
                });
                backup.on('end', end =>{
                    backupStreams = JSON.parse(body);
                    var json = JSON.stringify( {
                        "streamId": "a",
                        "type": "exercise-1/streams",
                        "content": [ JSON.stringify(sourceStreams.streams) + "," + JSON.stringify(backupStreams.streams)]
                    });
                    var postOptions = {
                        method: 'POST',
                        host: backupUsername+".pryv.me",
                        path: '/events',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': json.length

                        },
                        auth: backupToken,

                    };
                    var req = https.request(postOptions, post =>{
                        console.log(`statusCode: ${post.statusCode}`);

                        post.on('data', d1 => {
                            console.log('DATA');
                            res.send(d1);
                            result += d1;
                        });
                        post.on('error', error => {
                            console.error(error)
                        });
                        post.on('end', end => {
                            console.log(end)
                        });
                    });
                    req.write(json);
                    req.end();
                });

            });
        });
    });
    console.log('result');


});

app.listen(port);
console.log("Listening on port " + port);
