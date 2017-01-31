

const BarChart = require('../server/ctrl/barchart');
const chai = require('chai');

const expect = chai.expect;

// Reads in the API key
require('dotenv').load('../.env');

describe('BarChart class', function() {

    var barchart = null;

    beforeEach( () => {
        barchart = new BarChart(process.env.BARCHART_KEY);
    });

    afterEach( () => {
        barchart = null;
    });

    it('Fetches stock data using external API', function(done) {
        barchart.getQuote( (err, res) => {
            done();
            expect(err).to.be.null;
            console.log(JSON.stringify(res));
        });
    });

});
