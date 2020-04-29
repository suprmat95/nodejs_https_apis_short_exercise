var express = require("express")
var bodyParser = require('body-parser');
const https = require('https');
const async = require('async');
var app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
var port = 1234;

app.get("/", function(req, res){
    res.send("It works!");
});
app.post('/data', function (req, res) {
    var sourceUsername = req.body.source.username;
    var sourceToken = req.body.source.token;
    var backupUsername = req.body.backup.username;
    var backupToken = req.body.backup.token;
    var sourceOptions = {
        method: 'GET',
        host: sourceUsername + ".pryv.me",
        path: '/streams',
        auth: sourceToken,
    };
    var backupOptions = {
        method: 'GET',
        host: backupUsername + ".pryv.me",
        path: '/streams',
        auth: backupToken,
    };
    async.parallel([
            function(callback) {
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
                        callback(null,JSON.parse(body))

                    });
                });

            },
            function(callback) {
                https.get(backupOptions, backup =>{
                    var body = ' ';
                    console.log(`statusCode: ${backup.statusCode}`);

                    backup.on('data', d1 => {
                        body += d1;
                    });
                    backup.on('error', error => {
                        console.error(error)
                    });
                    backup.on('end', end =>{
                        callback(null,JSON.parse(body))
                    });

                });
            }
        ],
        function(err, results) {
            console.log(results);
            var json = JSON.stringify( {
                "streamId": "a",
                "type": "exercise-1/streams",
                "content": [results]
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
                    res.send(d1);
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

app.listen(port);
console.log("Listening on port " + port);
