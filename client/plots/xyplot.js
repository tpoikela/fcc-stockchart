
/*
 * Data to plot (an array of these):
{
    "symbol":"GOOG",
    "timestamp":"2016-09-01T00:00:00-04:00",
    "tradingDay":"2016-09-01",
    "open":769.25,
    "high":771.02,
    "low":764.3,
    "close":768.78,
    "volume":925100,
    "openInterest":null
}
*/

const d3 = require('d3');

class XYPlot {

    constructor(elemID, data) {
        console.log('Constructing the plot now');
        this.elemID = elemID;
        this.priceType = 'high';

        var maxWidth = 800;
        var maxHeight = 560;
        var margin = {top: 10, left: 10, right: 10, bottom: 20};

        var chartDiv = d3.select(elemID);

        if (!chartDiv) {
            throw new Error('elemID must point to existing elem');
        }

        var w = chartDiv.style('width').replace('px', '');
        console.log('chartDiv w is ' + w);

        var svg = d3.select('svg');
        svg.attr('style', 'height: ' + maxHeight + 'px');
        svg.attr('style', 'width: ' + maxWidth + 'px');

        var svgWidth = w * 0.8;
        var svgHeight = svg.style('height').replace('px', '');
        maxWidth = svgWidth - margin.left - margin.right;
        maxHeight = svgHeight - margin.top - margin.bottom;

        // Create X-axis with trading days
        var tradingDays = data.map( (item) => {
            return item.tradingDay;
        });

        var prices = data.map( (item) => {
            var price = parseFloat(item[this.priceType]);
            return price;
        });

        var nLastDay = tradingDays.length - 1;

        var firstDay = new Date(tradingDays[0]);
        var lastDay = new Date(tradingDays[nLastDay]);

        var xScale = d3.scaleTime()
            .domain([firstDay, lastDay])
            .range([0, maxWidth]);

        var minPrice = Math.min.apply(null, prices);
        var maxPrice = Math.max.apply(null, prices);
		this.minY = minPrice;
		this.maxY = maxPrice;

        console.log('min: ' + minPrice + ' -- max: ' + maxPrice);

        var yScale = d3.scaleLinear()
            .domain([maxPrice + 10, minPrice - 10])
            .range([0, maxHeight]);

        // Create inner g-element which applies the margins
        var g = svg.append('g')
            .attr('id', 'g-margins')
            .attr('transform', 'translate(' + margin.left + ','
                + margin.top + ')');
		this.g = g;

        var xAxisY = maxHeight;

        // Create X-axis
        var xAxis = g.append('g');
        xAxis.attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + xAxisY + ')')
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

		this.createPlot(g, 'blue', data);

        // Draw dots

        // Draw lines between dots

        this.svg = svg;
        this.chartDiv = chartDiv;
    }

    dayToInt(day) {
        day = day.replace(/-/g, '');
        day = parseInt(day, 10);
        return day;
    }

    /* Selects which data is plotted. */
    setPlotted(name) {
        console.log(name);

    }

    /* Set monthly or yearly view etc.*/
    setScale(scaleType) {
        console.log(scaleType);

    }

	addData(data) {
		this.createPlot(this.g, 'yellow', data);

	}

	createPlot(g, color, data) {
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
			.attr('class', 'plot-line')
			.attr('fill', 'none')
			.attr('stroke-width', 2)
			.style('stroke', color)
			.attr('d', plotLine);

        g.selectAll('.randomValueXX')
            .data(data).enter()
            .append('circle')
                .attr('class', '.pricePoint')
                .attr('r', 5)
                .attr('cx', (d) => {
                    var day = new Date(d.tradingDay);
                    var cx = this.xScale(day);
                    console.log('Returning cx: ' + day + ' => ' + cx);
                    return cx;
                })
                .attr('cy', (d) => {
                    var price = d[this.priceType];
                    var cy = this.yScale(price);
                    console.log('Returning cy: ' + price + ' => ' + cy);
                    return cy;
                })
                .style('fill', color);

	}

}

module.exports = XYPlot;
