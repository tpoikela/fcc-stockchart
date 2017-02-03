
'use strict';

const request = require('request');
const qs = require('querystring');

var uri = 'http://marketdata.websol.barchart.com';

class BarChart {

    constructor(key) {
        if (!key) {
            throw new Error('API key must be given.');
        }
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
        var queryStr = this.getQueryString(obj);
        var fullURI = uri + '/getHistory.json?' + queryStr;

        request.get(fullURI, (err, res, body) => {
            if (err) {
                cb(err, null, null);
            }
            else {
                cb(null, res, body);
            }
        });
    }

    /* For retrieving price data about the stocks.*/
    getQuote(obj, cb) {
        var queryStr = this.getQueryString(obj);
        var fullURI = uri + '/getQuote.json?' + queryStr;

        request.get(fullURI, (err, res, body) => {
            if (err) {
                cb(err, null, null);
            }
            else {
                cb(null, res, body);
            }
        });

    }

}

module.exports = BarChart;
