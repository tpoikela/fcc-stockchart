

const BarChart = require('../server/ctrl/barchart');
const chai = require('chai');
const sinon = require('sinon');

var request = require('request');

const expect = chai.expect;

// Calls the real API if false
var mockReq = false;
checkPrerequisites(mockReq);

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
            reqGet.yields(null, {
                body: {results: [{}, {}]}
            });
        }

        barchart.getQuote(obj, (err, res, body) => {
            expect(err).to.be.null;
            expect(body).not.to.be.null;
            var bodyObj = JSON.parse(body);
            expect(bodyObj.results).not.to.be.null;
            console.log(JSON.stringify(body));
            done();
        });
    });

    it('Fetches historical stock data from ext. API', function(done) {
        var obj = {
            symbol: 'IBM',
            type: 'daily',
            startDate: '20170120000000'
        };

        if (mockReq) {
            reqGet.yields(null, {body: {results: []}});
        }

        barchart.getHistory(obj, (err, res, body) => {
            var bodyObj = JSON.parse(body);
            expect(err).to.be.null;
            expect(bodyObj.results).not.to.be.null;
            done();
        });
    });


    it('Handles missing symbols correctly', function(done) {
        var obj = {
            symbol: 'NOT_FOUND',
            type: 'daily',
            startDate: '20170101000000'
        };

        if (mockReq) {
            reqGet.yields(null, {body: {results: []}});
        }

        barchart.getHistory(obj, (err, res, body) => {
            var bodyObj = JSON.parse(body);
            expect(err).to.be.null;
            expect(bodyObj.results).to.be.null;
            done();
        });
    });

});


function checkPrerequisites(mockReq) {
    if (!mockReq) {

        console.log('Checking for API key');

        // Reads in the API key
        require('dotenv').load('../.env');

        if (!process.env.BARCHART_KEY) {
            var msg = 'barchartTest.js cannot be run without an API key';
            msg += 'Specify key as BARCHART_KEY in .env';
            var err = new Error(msg);
            throw err;
        }
    }
}
