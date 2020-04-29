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
    https.get(sourceOptions, res =>{
        var body = ' ';
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', d1 => {
            body += d1;
            process.stdout.write(d1)
        });
        res.on('error', error => {
            console.error(error)
        });
        res.on('end', end =>{
            console.log('\nPrimo end\n')
            sourceStreams = JSON.parse(body);
            https.get(backupOptions, res =>{
                var body = ' ';
                console.log(`statusCode: ${res.statusCode}`);

                res.on('data', d1 => {
                    body += d1;
                    process.stdout.write(d1)
                });
                res.on('error', error => {
                    console.error(error)
                });
                res.on('end', end =>{
                    console.log('\nsecondo end\n')

                    backupStreams = JSON.parse(body);
                    var json =JSON.stringify( {
                        "streamId": "a",
                        "type": "exercise-1/streams",
                        "content": [ JSON.stringify(sourceStreams.streams) + "," + JSON.stringify(backupStreams.streams)]
                    });
                    console.log('Streams\n');
                    console.log(sourceStreams.streams.children)
                    console.log('Json: \n');
                    console.log(json)
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
                    var req = https.request(postOptions, res =>{
                        console.log('\nSto facendo la post\n')
                        var body = ' ';
                        console.log(`statusCode: ${res.statusCode}`);

                        res.on('data', d1 => {
                            process.stdout.write(d1)
                        });
                        res.on('error', error => {
                            console.log('\nERROORREEEE')
                            console.error(error)
                        });
                        res.on('end', end => {
                            console.log(end)
                        });
                    });
                    req.write(json);
                    req.end();

                });
            });
        });
    });

    res.send(req.body);

});

app.listen(port);
console.log("Listening on port " + port);
