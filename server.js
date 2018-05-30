// Imports
var express    = require('express');
var bodyParser = require('body-parser');
var router     = require('./router').router;

// Instantiate server
var server = express();

// Body Parser configuration
server.use(bodyParser.urlencoded({ exetend: true}));
server.use(bodyParser.json());

// Routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>HELLO WORLD! :)</h1>')
});

server.use('/api/', router);

// Launch server
server.listen(3000, function() {
   console.log('Server started - http://localhost:3000');
});