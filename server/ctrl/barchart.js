
'use strict';

const request = require('request');

var uri = 'http://ondemand.websol.barchart.com/getQuote.json?';
var symbols = 'symbols=AAPL%2CGOOG&fields=fiftyTwoWkHigh%2CfiftyTwoWkHighDate'
    + '%2CfiftyTwoWkLow%2CfiftyTwoWkLowDate&mode=I';

class BarChart {

    constructor(key) {
        this.key = key;
    }

    getQuote(cb) {
        var key = 'key=' + this.key;
        var fullURI = uri + key + '&' + symbols;

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
