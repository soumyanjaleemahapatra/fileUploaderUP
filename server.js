var express = require('express'),
    app = express(),
    server = require('http').createServer(app);

server.listen(8080);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    console.log("Request received");
    res.sendfile(__dirname + '/index.htm');
});
