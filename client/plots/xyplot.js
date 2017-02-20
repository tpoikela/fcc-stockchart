
'use strict';

const d3 = require('d3');
const DataCtrl = require('../ctrl/data-ctrl');

/* This class is used to manage the data and select which data is used in the
 * plotting. */
class XYPlot {

    constructor(elemID, data) {

        this.ctrl = new DataCtrl();
        this.quiet = false;
        this.verbosity = 0;

        this.msPerDay = 24 * 3600 * 1000;

        this.data = {};
        this.colors = ['red', 'blue', 'green', 'cyan', 'brown', 'purple'];

        this.logMsg('Constructing the plot now');
        this.elemID = elemID;
        this.priceType = 'high';

        this.circleRadius = 5;
        this.maxWidth = 1000;
        this.maxHeight = 360;
        var margin = {top: 10, left: 20, right: 10, bottom: 20};

        var chartDiv = d3.select(elemID);

        if (!chartDiv) {
            throw new Error('elemID must point to existing elem');
        }

        var chartDivWidth = chartDiv.style('width').replace('px', '');
        this.logMsg('chartDiv weight is ' + chartDivWidth);

        chartDiv.append('svg');

        var svg = d3.select('svg');
        svg.style('height', this.maxHeight + 'px');

        var svgWidth = chartDivWidth * 0.9;
        var svgHeight = svg.style('height').replace('px', '');
        this.maxWidth = svgWidth - margin.left - margin.right - 30;
        this.maxHeight = svgHeight - margin.top - margin.bottom;
        svg.style('width', svgWidth + 'px');

        this.logMsg('svgHeight is ' + svgHeight);
        this.logMsg('svgWidth ' + svgWidth);
        this.logMsg('plot maxHeight will be ' + this.maxHeight);
        this.logMsg('plot maxWidth will be ' + this.maxWidth);

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

        // Compute min/max value for y-axis and create Y-scale
		var minMaxPrice = this.ctrl.getMinMaxY(data, this.priceType);
        var minPrice = minMaxPrice[0];
        var maxPrice = minMaxPrice[1];
        this.minY = minPrice;
		this.maxY = maxPrice;

        this.logMsg('min: ' + minPrice + ' -- max: ' + maxPrice);

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
        var yAxisLeft = this.maxWidth;
        var yAxis = g.append('g');
        yAxis.attr('class', 'axis y-axis')
            .text('price')
            .attr('transform', 'translate(' + yAxisLeft + ','
                + '0' + ')')
            .call(d3.axisRight(yScale));

		// Store axes and scales for other functions
        this.xScale = xScale;
        this.yScale = yScale;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.svg = svg;
        this.chartDiv = chartDiv;

        this.createPlot(g, this.colors.pop(), data);

        this.tooltip = d3.select('body')
            .append('div')
            .classed('temp-tooltip', true)
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('visibility', 'hidden');

    }

    /* Adds a new dataset to the plot.*/
	addData(data) {
        if (data && data.length > 0) {
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
        else {
            console.error('ERROR. data length is 0');
        }
	}

    /* Removes a plot with the given stock symbol.*/
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

            // Scale y-values with existing plots
            this.minY = this.ctrl.getGlobalMinY(this.data);
            this.maxY = this.ctrl.getGlobalMaxY(this.data);

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

    /* Chooses y-axis values from growth/absolute stock prices.*/
    setAxisTypeY(type) {
        if (type === 'growth') {
            if (this.priceType !== 'growth') {
                this.growthForType = this.priceType;
                this.ctrl.computeGrowthRates(this.data, this.minX,
                    this.growthForType);
                this.priceType = 'growth';
            }
        }
        else {
            this.priceType = type;

            var symbols = Object.keys(this.data);
            symbols.forEach( (sym) => {
                var minMax = this.ctrl.getMinMaxY(this.data[sym].data, type);
                this.data[sym].minY = minMax[0];
                this.data[sym].maxY = minMax[1];
            });

        }

        var minY = this.ctrl.getGlobalMinY(this.data);
        var maxY = this.ctrl.getGlobalMaxY(this.data);
        this.logMsg('setAxisTypeY new global min ' + minY + ' max ' + maxY);
        this.minY = minY;
        this.maxY = maxY;
        this.rescaleY(minY, maxY, true);
        this.redrawAllPlots();

    }


    /* Sets the X-axis date range.*/
    setRangeX(range) {
        var dateNow = this.ctrl.getLatestDate(this.data);
        var nowMs = dateNow.getTime();
        var startDateMs = -1;

        // Compute startDate in millisecond and adjust circle radius based on
        // the selected time span
        switch (range) {
            case '1m':
                startDateMs = nowMs - 30 * this.msPerDay;
                this.circleRadius = 5;
                break;
            case '3m':
                startDateMs = nowMs - 90 * this.msPerDay;
                this.circleRadius = 4;
                break;
            case '6m':
                startDateMs = nowMs - 180 * this.msPerDay;
                this.circleRadius = 3;
                break;
            case '1y':
                startDateMs = nowMs - 365 * this.msPerDay;
                this.circleRadius = 3;
                break;
            default: console.error('Incorrect range format: ' + range);
        }

        // Set min/max date and scale X-axis using those values
        var startDate = new Date();
        startDate.setTime(startDateMs);
        this.minX = startDate;
        this.maxX = dateNow;
        this.rescaleX(startDate, dateNow, true);

        if (this.priceType === 'growth') {
            this.ctrl.computeGrowthRates(this.data, this.minX,
                this.growthForType);
            var minY = this.ctrl.getGlobalMinY(this.data);
            var maxY = this.ctrl.getGlobalMaxY(this.data);
            this.minY = minY;
            this.maxY = maxY;
            this.rescaleY(minY, maxY, true);
        }

        this.redrawAllPlots();

    }

    /* Redraws all plots. */
    redrawAllPlots() {
        // Refresh all existing plots
        var symbols = Object.keys(this.data);
        symbols.forEach( (sym) => {
            this.redrawPlot(sym);
        });
    }

    /* Creates a plot into 'g' using specified color and data.*/
	createPlot(g, color, data) {

        var symbol = data[0].symbol;
        this.logMsg('createPlot for symbol ' + symbol);
        if (!symbol) {
            throw new Error('No symbol found in data.');
        }

        var minMaxDate = this.ctrl.getMinMaxDate(data);
        var minDate = minMaxDate[0];
        var maxDate = minMaxDate[1];

        var minMaxPrice = this.ctrl.getMinMaxY(data, this.priceType);
        var minPrice = minMaxPrice[0];
        var maxPrice = minMaxPrice[1];

        // Store data for this symbol for later reference
        this.data[symbol] = {
            data: data,
            minX: minDate,
            maxX: maxDate,
            minY: minPrice,
            maxY: maxPrice,
            color: color
        };

        if (this.priceType === 'growth') {
            var minShownDate = minDate;
            this.ctrl.adjustWeekendDate(minShownDate);
            this.computeGrowthForSymbol(minShownDate, symbol);
        }

        var nSyms = Object.keys(this.data).length;
        var force = nSyms === 1;
        if (force) {
            this.minY = minPrice;
            this.maxY = maxPrice;
        }

        this.rescaleY(minPrice, maxPrice, force);
        this.drawPlot(g, symbol, data, color);
        this.logMsg('Finished createPlot for symbol ' + symbol);
	}

    /* Returns the color used for given symbol. */
    getColor(symbol) {
        if (this.data.hasOwnProperty(symbol)) {
            return this.data[symbol].color;
        }
        else {
            console.error('Symbol ' + symbol + ' does not exist.');
        }
        return null;
    }

    /* Draws plot for 'symbol' using given data. Doesn't clear previous
     * plots.*/
    drawPlot(g, symbol, data, color) {
        var dataFiltered = this.ctrl.filterData(data, this.minX, this.maxX);
		var plotLine = d3.line()
			.x( d => {
				return this.xScale(new Date(d.tradingDay));
			})
			.y( d => {
                if (d.hasOwnProperty(this.priceType)) {
                    return this.yScale(d[this.priceType]);
                }
                else {
                    return 0;
                }
            });

		// Add the path for the plot
		g.append('path')
			.datum(dataFiltered)
			.attr('class', 'plot-line ' + 'plot-line-' + symbol)
			.attr('fill', 'none')
			.attr('stroke-width', 2)
			.style('stroke', color)
			.attr('d', plotLine);

        g.selectAll('.putAnythingYouWantHere')
            .data(dataFiltered).enter()
            .append('circle')
                .attr('class', 'price-point ' + 'price-point-' + symbol)
                .attr('r', this.circleRadius)
                .attr('cx', d => {
                    var day = new Date(d.tradingDay);
                    var cx = this.xScale(day);
                    return cx;
                })
                .attr('cy', d => {
                    var yValue = d[this.priceType];
                    if (yValue || yValue === 0) {
                        var cy = this.yScale(yValue);
                        return cy;
                    }
                    else {
                        return 0;
                    }
                })
                .style('fill', color)

                // Needed for showing/hiding the tooltip
                .on('mouseover', d => {
                    var tooltipHTML = this.getTooltipHTML(d);
                    this.tooltip.html(tooltipHTML);
                    return this.tooltip.style('visibility', 'visible');
                })

                .on('mousemove', () => {
                    var x = d3.event.pageX;
                    var y = d3.event.pageY;
                        return this.tooltip
                            .style('top', (y - 10) + 'px')
                            .style('left', (x + 10) + 'px');
                })
                .on('mouseout', () => {
                    return this.tooltip.style('visibility', 'hidden');
                });

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
    rescaleX(minDate, maxDate, force = false) {
        var needRescaling = false;
        if (!force) {
            if (minDate < this.minX) {
                this.minX = minDate;
                needRescaling = true;
            }
            if (maxDate > this.maxX) {
                this.maxX = maxDate;
                needRescaling = true;
            }
        }
        else {
            needRescaling = true;
        }

        if (needRescaling) {
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
        var needRescaling = false;
        if (!force) {
            if (minPrice < this.minY) {
                this.minY = minPrice;
                needRescaling = true;
            }
            if (maxPrice > this.maxY) {
                this.maxY = maxPrice;
                needRescaling = true;
            }
        }
        else {
            needRescaling = true;
        }

        if (needRescaling) {
            var maxY = this.maxY + 0.10 * this.maxY;
            var minY = this.minY - 0.10 * this.minY;
            this.yScale.domain([maxY, minY]);
            this.yAxis.call(d3.axisRight(this.yScale));
        }

    }

    /* Formats the HTML for tooltip based on the weather data.*/
    getTooltipHTML(d) {
        var html = '<p>';
        html += d.symbol + '<br/>';
        html += 'Trading day: ' + d.tradingDay + '<br/>';
        html += 'High: ' + d.high + '<br/>';
        html += 'Low: ' + d.low + '<br/>';
        html += '</p>';
        return html;
    }

    logMsg(msg, verb = 1) {
        if (!this.quiet && verb <= this.verbosity) {
            console.log(msg);
        }
    }

}

module.exports = XYPlot;
