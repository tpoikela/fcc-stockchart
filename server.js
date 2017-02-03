/*
 * Server entry point file for the Stock Chart app.
 */
'use strict';

var $DEBUG = 0;

// When deployed to heroku, don't use .env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
    $DEBUG = process.env.DEBUG || 0;
    if ($DEBUG) {
        console.log('Loaded .env file OK. Node env: '
        + process.env.NODE_ENV);
    }
}
else {
    console.log('Running now in production environment');
}

// Load required modules
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
const BarChart = require('./server/ctrl/barchart');

// Sources for this app
var routes = require('./server/routes/index.js');

// Create express app and socket.io connection
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var barchart = new BarChart(process.env.BARCHART_KEY);

app.set('view engine', 'pug');

app.url = process.env.APP_URL;
console.log('The full APP url: ' + app.url);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// Initialize resource paths for the server
app.use('/build', express.static(process.cwd() + '/build'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.locals.pretty = true;


app.use(morgan('combined'));

routes(app);

var port = process.env.PORT || 8080;

http.listen(port, function() {
	console.log('StockChart Server listening on port ' + port + '...');
});

io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('client message', (msg) => {
        console.log('Server got message: ' + msg);
        var query = {
            symbol: msg.symbol,
            type: 'daily',
            startDate: '20160101000000'
        };

        barchart.getHistory(query, (err, res, body) => {
            if (err) {
                io.emit('server message', {error: 'An error occurred.'});
            }
            else {
                var newMsg = Object.assign({}, msg, {newMsg: 'Server says hi'});
                newMsg.body = body;
                io.emit('server message', newMsg);
            }

        });
    });
});

