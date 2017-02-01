

const BarChart = require('../server/ctrl/barchart');
const chai = require('chai');
const sinon = require('sinon');

var request = require('request');

const expect = chai.expect;

// Reads in the API key
require('dotenv').load('../.env');

// Calls the real API if false
var mockReq = true;

if (!process.env.BARCHART_KEY) {
    console.log('barchartTest.js cannot be run without an API key');
    console.log('Specify key as BARCHART_KEY in .env');
}
else {

describe('BarChart class', function() {

    var barchart = null;
    var reqGet = null;

    beforeEach( () => {
        barchart = new BarChart(process.env.BARCHART_KEY);
        if (mockReq) {
            reqGet = sinon.stub(request, 'get');
        }
    });

    afterEach( () => {
        barchart = null;
        if (mockReq) {
            reqGet.restore();
        }
    });

    it('Fetches stock quote using external API', function(done) {
        var obj = {
            symbols: ['AAPL', 'GOOG'],
            fields: ['fiftyTwoWkHigh', 'fiftyTwoWkHighDate'],
            mode: ['I']
        };

        if (mockReq) {
            reqGet.yields(null, {body: {results: []}});
        }

        barchart.getQuote(obj, (err, res) => {
            var results = res.body.results;
            expect(err).to.be.null;
            expect(res.body.results).to.exist;
            expect(results).to.have.length.above(0);
            done();
        });
    });

    it('Fetches historical stock data from ext. API', function(done) {
        var obj = {
            symbol: 'IBM',
            type: 'daily',
            startDate: '20160131000000'
        };

        if (mockReq) {
            reqGet.yields(null, {body: {results: []}});
        }

        barchart.getHistory(obj, (err, res) => {
            expect(err).to.be.null;
            expect(res.body.results).to.exist;
            done();
        });
    });

});

}
