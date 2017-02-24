
const expect = require('chai').expect;
const DataCtrl = require('../client/ctrl/data-ctrl');

var symData = [
    {tradingDay: '2016-01-01', high: 100},
    {tradingDay: '2016-02-01', high: 200},
    {tradingDay: '2016-03-01', high: 300},
    {tradingDay: '2016-04-01', high: 400},
    {tradingDay: '2016-05-01', high: 500}
];


var symData2 = [
    {tradingDay: '2015-12-01'},
    {tradingDay: '2016-02-01'},
    {tradingDay: '2016-06-01'},
    {tradingDay: '2016-09-01'},
    {tradingDay: '2017-05-01'}
];

var data = {
    XXX: {
        minY: 0,
        maxY: 10,
        data: symData

    },
    YYY: {
        minY: 2,
        maxY: 12,
        data: symData2
    }
};

describe('DataCtrl class', function() {

    var ctrl = null;

    beforeEach( () => {
        ctrl = new DataCtrl();
    });

    afterEach( () => {
        ctrl = null;
    });


    it('should return min/max dates from data', function() {
        var minMax = ctrl.getMinMaxDate(symData);
        var min = minMax[0];
        var max = minMax[1];
        expect(min.getMonth()).to.equal(0);
        expect(max.getMonth()).to.equal(4);
    });

    it('should return index of given data (or -1)', function() {
        var minDate = new Date('2016-03-01');
        var index = ctrl.getDateIndex(minDate, symData);
        expect(index).to.equal(2);

        minDate = new Date('2017-03-01');
        index = ctrl.getDateIndex(minDate, symData);
        expect(index).to.equal(-1);

    });

    it('adjusts weekend date to weekday correctly', function() {
        var sunday = new Date('2017-02-05');
        ctrl.adjustWeekendDate(sunday);
        var monday = sunday;
        expect(monday.getUTCDay()).to.equal(1);


        var saturday = new Date('2017-08-12');
        ctrl.adjustWeekendDate(saturday);
        var friday = saturday;
        expect(friday.getUTCDay()).to.equal(5);

    });

    it('retrieves global minY/maxY of all symbols', function() {
        var minY = ctrl.getGlobalMinY(data);
        expect(minY).to.equal(0);

        var maxY = ctrl.getGlobalMaxY(data);
        expect(maxY).to.equal(12);
    });

    it('returns the latest date entry in first dataset', function() {
        var latestDate = ctrl.getLatestDate(data);
        expect(latestDate.getMonth()).to.equal(4);
        expect(latestDate.getFullYear()).to.equal(2016);
    });

    it('can filter data based on min/max dates', function() {
        ctrl.verbosity = 0;
        var minX = new Date('2016-02-01');
        var maxX = new Date('2016-04-15');
        var res = ctrl.filterData(symData, minX, maxX);
        var nLast = res.length - 1;
        expect(res[0].tradingDay).to.equal('2016-02-01');
        expect(res[nLast].tradingDay).to.equal('2016-04-01');

    });

    it('computes growth rates for stock data', function() {
        var minDate = new Date('2016-01-01');
        ctrl.verbosity = 0;
        ctrl.computeGrowthForSymbol(data, minDate, 'XXX', 'high');
        data.XXX.data.forEach( (item, index) => {
            var expGrowth = index * 100;
            expect(item.growth).to.equal(expGrowth);
        });

    });

});
