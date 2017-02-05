
const d3 = require('d3');

class XYPlot {

    constructor(elemID, data) {
        this.data = {};
        this.colors = ['red', 'blue', 'green', 'cyan', 'brown', 'purple'];

        console.log('Constructing the plot now');
        this.elemID = elemID;
        this.priceType = 'high';

        var maxWidth = 1000;
        var maxHeight = 560;
        var margin = {top: 10, left: 10, right: 10, bottom: 20};

        var chartDiv = d3.select(elemID);

        if (!chartDiv) {
            throw new Error('elemID must point to existing elem');
        }

        var w = chartDiv.style('width').replace('px', '');
        console.log('chartDiv w is ' + w);

        chartDiv.append('svg');

        var svg = d3.select('svg');
        svg.attr('style', 'height: ' + maxHeight + 'px');
        svg.attr('style', 'width: ' + maxWidth + 'px');

        var svgWidth = w * 0.8;
        var svgHeight = svg.style('height').replace('px', '');
        this.maxWidth = svgWidth - margin.left - margin.right;
        this.maxHeight = svgHeight - margin.top - margin.bottom;

        // Create X-axis with trading days
        var tradingDays = data.map( (item) => {
            return item.tradingDay;
        });

        var nLastDay = tradingDays.length - 1;

        this.minX = new Date(tradingDays[0]);
        this.maxX = new Date(tradingDays[nLastDay]);

        var xScale = d3.scaleTime()
            .domain([this.minX, this.maxX])
            .range([0, this.maxWidth]);

		var minMaxPrice = this.getMinMaxPrices(data);
        var minPrice = minMaxPrice[0];
        var maxPrice = minMaxPrice[1];
        this.minY = minPrice;
		this.maxY = maxPrice;

        console.log('min: ' + minPrice + ' -- max: ' + maxPrice);

        var yScale = d3.scaleLinear()
            .domain([maxPrice + 10, minPrice - 10])
            .range([0, this.maxHeight]);

        // Create inner g-element which applies the margins
        var g = svg.append('g')
            .attr('id', 'g-margins')
            .attr('transform', 'translate(' + margin.left + ','
                + margin.top + ')');
		this.g = g;

        // Create X-axis
        var xAxis = g.append('g');
        xAxis.attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + this.maxHeight + ')')
            .call(
                d3.axisBottom(xScale)
            );

        // Create Y-axis
        var yAxis = g.append('g');
        yAxis.attr('class', 'axis y-axis')
            .text('price')
            .call(d3.axisRight(yScale)
        );

		// Store axes and scales for other functions
        this.xScale = xScale;
        this.yScale = yScale;
        this.xAxis = xAxis;
        this.yAxis = yAxis;

		this.createPlot(g, this.colors.pop(), data);

        // Draw dots

        // Draw lines between dots

        this.svg = svg;
        this.chartDiv = chartDiv;
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

    /* Returns min and max price in the data.*/
	getMinMaxPrices(data) {
        var prices = data.map( item => {
            var price = parseFloat(item[this.priceType]);
            return price;
        });

        var minPrice = Math.min.apply(null, prices);
        var maxPrice = Math.max.apply(null, prices);

		return [minPrice, maxPrice];
	}

    /* Adds a new dataset to the plot.*/
	addData(data) {
        var symbol = data[0].symbol;
        if (!this.data.hasOwnProperty(symbol)) {
            this.createPlot(this.g, this.colors.pop(), data);

            // Refresh existing plots (if scales have changed)
            var symbols = Object.keys(this.data);
            symbols.forEach( (sym) => {
                if (sym !== symbol) {
                    this.redrawPlot(sym);
                }
            });
        }
        else {
            console.error('Symbol ' + symbol + ' already exists.');
        }
	}

    /* Removes a plot with the given symbol.*/
    removePlot(symbol) {
        if (this.data.hasOwnProperty(symbol)) {
            this.g.select('.plot-line-' + symbol)
                .remove();

            this.g.selectAll('.price-point-' + symbol)
                .remove();

            // Finally, add the used color back, and remove symbol data
            var color = this.data[symbol].color;
            this.colors.push(color);
            delete this.data[symbol];

            // TODO add scaling of x/y-domain
            this.minY = this.getGlobalMinY();
            this.maxY = this.getGlobalMaxY();

            this.rescaleY(this.minY, this.maxY, true);

            var symbols = Object.keys(this.data);
            symbols.forEach( (sym) => {
                if (sym !== symbol) {
                    this.redrawPlot(sym);
                }
            });

        }
        else {
            console.error('No symbol. Cannot remove ' + symbol);
        }

    }

	createPlot(g, color, data) {

        var symbol = data[0].symbol;
        console.log('createPlot for symbol ' + symbol);
        if (!symbol) {
            throw new Error('No symbol found in data.');
        }

        var minMaxDate = this.getMinMaxDate(data);
        var minDate = minMaxDate[0];
        var maxDate = minMaxDate[1];

        var minMaxPrice = this.getMinMaxPrices(data);
        var minPrice = minMaxPrice[0];
        var maxPrice = minMaxPrice[1];

        this.data[symbol] = {
            data: data,
            minX: minDate,
            maxX: maxDate,
            minY: minPrice,
            maxY: maxPrice,
            color: color
        };

        var nSyms = Object.keys(this.data).length;
        var force = nSyms === 1;
        if (force) {
            this.minY = minPrice;
            this.maxY = maxPrice;
        }

        this.rescaleX(minDate, maxDate);
        this.rescaleY(minPrice, maxPrice, force);
        this.drawPlot(g, symbol, data, color);
        console.log('Finished createPlot for symbol ' + symbol);
	}

    drawPlot(g, symbol, data, color) {
		var plotLine = d3.line()
			.x( d => {
				return this.xScale(new Date(d.tradingDay));
			})
			.y( d => {
				return this.yScale(d[this.priceType]);
		});

		// Add the path for the plot
		g.append('path')
			.datum(data)
			.attr('class', 'plot-line ' + 'plot-line-' + symbol)
			.attr('fill', 'none')
			.attr('stroke-width', 2)
			.style('stroke', color)
			.attr('d', plotLine);

        g.selectAll('.randomValueXX')
            .data(data).enter()
            .append('circle')
                .attr('class', 'price-point ' + 'price-point-' + symbol)
                .attr('r', 5)
                .attr('cx', (d) => {
                    var day = new Date(d.tradingDay);
                    var cx = this.xScale(day);
                    return cx;
                })
                .attr('cy', (d) => {
                    var price = d[this.priceType];
                    var cy = this.yScale(price);
                    return cy;
                })
                .style('fill', color);

    }

    /* Redraws a plot. Clears the GUI elements and updates them.*/
    redrawPlot(symbol) {
        var data = this.data[symbol].data;
        var color = this.data[symbol].color;
        var g = this.g;
        g.select('.plot-line-' + symbol).remove();
        g.selectAll('.price-point-' + symbol).remove();
        this.drawPlot(g, symbol, data, color);
    }

    /* Rescales X axis values.*/
    rescaleX(minDate, maxDate) {
        var createNewScale = false;
        if (minDate < this.minX) {
            this.minX = minDate;
            createNewScale = true;
        }
        if (maxDate > this.maxX) {
            this.maxX = maxDate;
            createNewScale = true;
        }

        if (createNewScale) {
            this.xScale = d3.scaleTime()
                .domain([this.minX, this.maxX])
                .range([0, this.maxWidth]);
            this.xAxis.attr('class', 'axis x-axis')
                .attr('transform', 'translate(0, ' + this.maxHeight + ')')
                .call(
                    d3.axisBottom(this.xScale)
                );
        }

    }

    /* Rescales Y axis values.*/
    rescaleY(minPrice, maxPrice, force = false) {
        var createNewScale = false;
        if (!force) {
            if (minPrice < this.minY) {
                this.minY = minPrice;
                createNewScale = true;
            }
            if (maxPrice > this.maxY) {
                this.maxY = maxPrice;
                createNewScale = true;
            }
        }
        else {
            createNewScale = true;
        }

        if (createNewScale) {
            this.yScale = d3.scaleLinear()
            .domain([this.maxY + 10, this.minY - 10])
            .range([0, this.maxHeight]);

            this.yAxis.attr('class', 'axis y-axis')
                .text('price')
                .call(d3.axisRight(this.yScale));

        }

    }

    /* Returns the smallest Y-value in all datasets.*/
    getGlobalMinY() {
        var minY = 0;
        var symbols = Object.keys(this.data);
        symbols.forEach( (item, index) => {
            var obj = this.data[item];
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
    getGlobalMaxY() {
        var maxY = 0;
        var symbols = Object.keys(this.data);
        symbols.forEach( (item, index) => {
            var obj = this.data[item];
            if (index === 0) {
                maxY = obj.maxY;
            }
            else if (obj.maxY < maxY) {
                maxY = obj.maxY;
            }

        });
        return maxY;
    }

}

module.exports = XYPlot;
