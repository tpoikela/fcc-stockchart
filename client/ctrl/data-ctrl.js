'use strict';

/* Data controller modifies the data according to given x-range and computes the
 * growth rates etc.
 */
class DataController {

    constructor(conf) {
        this.msPerDay = 24 * 3600 * 1000;
        this.verbosity = 1;

        if (conf) {
            if (conf.hasOwnProperty('verbosity')) {
                this.verbosity = conf.verbosity;
            }
        }
    }

    error(msg) {
        console.error('[ERROR] DataController: ' + msg);
    }

    /* Returns the earliest/latest dates in data.*/
    getMinMaxDate(data) {
        var dates = data.map( item => {
            var date = item.tradingDay;
            return date;
        });

        var nLast = dates.length - 1;
        var min = new Date(dates[0]);
        var max = new Date(dates[nLast]);

        return [min, max];
    }

    /* Returns the index of a given date for the data.*/
    getDateIndex(minDate, data) {
        var minDateStr = minDate.toDateString();
        return data.findIndex( elem => {
            var tradeDate = new Date(elem.tradingDay);
            return tradeDate.toDateString() === minDateStr;
        });
    }

    /* Adjust the date to Sat -> Fri or Sun -> Mon if given date coincides with
     * weekend.*/
    adjustWeekendDate(date) {
        if (date.getDay() === 0) {
            date.setTime(date.getTime() + this.msPerDay);
        }
        else if (date.getDay() === 6) {
            date.setTime(date.getTime() - this.msPerDay);
        }
    }

    /* Returns the smallest Y-value in all datasets.*/
    getGlobalMinY(data) {
        var minY = 0;
        var symbols = Object.keys(data);
        symbols.forEach( (item, index) => {
            var obj = data[item];
            if (index === 0) {
                minY = obj.minY;
            }
            else if (obj.minY < minY) {
                minY = obj.minY;
            }

        });
        return minY;
    }

    /* Returns the largest Y-value in all datasets.*/
    getGlobalMaxY(data) {
        var maxY = 0;
        var symbols = Object.keys(data);
        symbols.forEach( (item, index) => {
            var obj = data[item];
            if (index === 0) {
                maxY = obj.maxY;
            }
            else if (obj.maxY > maxY) {
                maxY = obj.maxY;
            }

        });
        return maxY;
    }

    /* Returns the latest date in the data array.*/
    getLatestDate(data) {
        var syms = Object.keys(data);
        if (syms.length > 0) {
            var symbol = syms[0];
            var dataLen = data[symbol].data.length;
            var lastDate = data[symbol].data[dataLen - 1].tradingDay;
            return new Date(lastDate);
        }
        else {
            console.error('No symbols in the plot found.');
        }
        return null;
    }


    /* Filters data based on minX and maxX values. */
    filterData(data, minX, maxX) {
        if (minX < maxX) {
            var result = [];
            this.logMsg('filterData max: ' + maxX + ' min: ' + minX);
            data.forEach( item => {
                var tradingDate = new Date(item.tradingDay);
                if (tradingDate <= maxX && tradingDate >= minX) {
                    result.push(item);
                }
            });
            this.logMsg('filterData: result has ' + result.length + ' items');
            return result;
        }
        else {
            console.error('minX must be < maxX.');
            return [];
        }
    }

    /* Returns min and max Y value in the data.*/
	getMinMaxY(data, priceType) {
        var prices = data.map( item => {
            var price = parseFloat(item[priceType]);
            return price;
        });

        var minPrice = Math.min.apply(null, prices);
        var maxPrice = Math.max.apply(null, prices);

		return [minPrice, maxPrice];
	}

    /* Computes growth rates from a given date to today.*/
    computeGrowthRates(data, minDate, growthForType) {
        var symbols = Object.keys(data);
        this.adjustWeekendDate(minDate);

        symbols.forEach( (symbol) => {
            this.computeGrowthForSymbol(data, minDate, symbol, growthForType);
        });

    }

    /* Computes the growth rates for given symbol. The rates are based on
     * previosly selected price view: 'high', 'low', etc...
     */
    computeGrowthForSymbol(data, minDate, symbol, growthForType) {
        var type = growthForType;
        var dataPerSymbol = data[symbol].data;
        var indexFound = this.getDateIndex(minDate, dataPerSymbol);

        var firstDate = dataPerSymbol[0].tradingDay;
        var firstDateObj = new Date(firstDate);

        var maxTries = 365;
        var numTry = 1;

        while (indexFound === -1 && numTry <= maxTries) {

            if (firstDateObj >= minDate) {
                indexFound = 0;
            }
            else {
                var msNextDay = numTry * this.msPerDay;
                var nextDate = new Date(minDate.getTime() + msNextDay);
                indexFound = this.getDateIndex(nextDate, dataPerSymbol);
            }

            ++numTry;
        }

        if (indexFound === -1) {
            var errMsg = 'For date ' + minDate + ' no data index found';
            console.error('Error for symbol ' + symbol + ': ' + errMsg);
            return;
        }

        this.logMsg('Found index ' + indexFound + ' for date ' + minDate);
        var startPrice = dataPerSymbol[indexFound][type];
        this.logMsg('Starting price is ' + startPrice);

        dataPerSymbol.forEach( item => {
            if (item.hasOwnProperty('growth')) {
                delete item.growth;
            }
        });

        var minGrowth = 0;
        var maxGrowth = 0;

        // Compute min/max rates and daily growth rates until today
        for (let i = indexFound; i < dataPerSymbol.length; i++) {
            var price = dataPerSymbol[i][type];
            var growth = 100 * (price / startPrice) - 100;
            dataPerSymbol[i].growth = growth;

            if (i === indexFound) {
                this.logMsg('growth for indexFound (' + indexFound + ') :' +
                    growth);
            }

            if (i === indexFound) {
                minGrowth = growth;
                maxGrowth = growth;
            }
            else if (growth < minGrowth) {
                minGrowth = growth;
            }
            else if (growth > maxGrowth) {
                maxGrowth = growth;
            }
        }
        data[symbol].minY = minGrowth;
        data[symbol].maxY = maxGrowth;

    }

    logMsg(msg, verb = 1) {
        if (verb <= this.verbosity) {
            console.log(msg);
        }
    }

}

module.exports = DataController;
