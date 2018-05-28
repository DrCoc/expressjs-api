// Imports
var express = require('express');

// Instantiate server
var server = express();

// Routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>HELLO WORLD! :)</h1>')
});

// Launch server
server.listen(3000, function() {
   console.log('Server started - http://localhost:3000');
});