
'use strict';

const request = require('request');

var uri = 'http://marketdata.websol.barchart.com';

/*
var symbols = 'symbols=AAPL%2CGOOG';
var fields = 'fields=fiftyTwoWkHigh%2CfiftyTwoWkHighDate'
    + '%2CfiftyTwoWkLow%2CfiftyTwoWkLowDate';
var mode = 'mode=I';

var histSym = 'symbol=IBM';
var histType = 'type=daily';
var histStart = 'startDate=20160131000000';
*/

const qs = require('querystring');


class BarChart {

    constructor(key) {
        this.key = key;
    }

    getQueryString(obj) {
        var query = Object.assign({}, {key: this.key}, obj);
        query.key = this.key;
        var queryStr = qs.stringify(query);
        return queryStr;
    }

    /* For retrieving historical information about stocks.*/
    getHistory(obj, cb) {
        var fullURI = uri + '/getHistory.json?';
        var queryStr = this.getQueryString(obj);
        fullURI += queryStr;

        console.log('getHistory QS: ' + queryStr);
        console.log('getHistory full URI: ' + fullURI);

        request.get(fullURI, (err, res) => {
            if (err) {
                cb(null, res);
            }
            else {
                cb(null, res);
            }
        });
    }

    /* For retrieving price data about the stocks.*/
    getQuote(obj, cb) {
        var queryStr = this.getQueryString(obj);
        var fullURI = uri + '/getQuote.json?' + queryStr;
        console.log('getQuote QS: ' + queryStr);

        request.get(fullURI, (err, res) => {
            if (err) {
                cb(err);
            }
            else {
                cb(null, res);
            }
        });

    }

}

module.exports = BarChart;
