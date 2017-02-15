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
const SocketCtrl = require('./server/ctrl/socket-ctrl');

// Sources for this app
var routes = require('./server/routes/index.js');

// Create express app and socket.io connection
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var barchart = new BarChart(process.env.BARCHART_KEY);

app.url = process.env.APP_URL;
console.log('The full APP url: ' + app.url);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// Initialize resource paths for the server
app.use('/build', express.static(process.cwd() + '/build'));
app.use('/public', express.static(process.cwd() + '/public'));

app.locals.pretty = true;

app.use(morgan('combined'));

routes(app);

var port = process.env.PORT || 8080;

// Used only for testing, before DB is connected
var stockData = {};

http.listen(port, function() {
	console.log('StockChart Server listening on port ' + port + '...');
});

var socketCtrl = new SocketCtrl(io, barchart, stockData);
socketCtrl.verbosity = 0;

