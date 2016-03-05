var express = require('express');
var app = express();
var multer  = require('multer');
var serverPort = 8080;

//var upload = multer({ dest: 'repo/' });

var upload = multer({ storage : storage }).single('file');

var storage =
    multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, 'repo/');
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname);
        }
    });

app.get('/', function(req, res) {
    app.use("/", express.static(__dirname));
    res.sendFile(__dirname + '/index.html');
});

//app.post('/upload',upload.single('file'),  function (req, res, next) {
app.post('/upload',function (req, res, next) {
    console.log('File uploader reached');
    upload(req,res,function(err) {
        //console.log(req);
        console.log(req.files);
        if(err) {
            return res.end("Error uploading file.");
            console.log('Error uploading file.');
        }
        res.end("File is uploaded");
        console.log('File is uploaded');
    });
});

app.listen(serverPort,function(){
    console.log("Server listening on " + serverPort);
});


