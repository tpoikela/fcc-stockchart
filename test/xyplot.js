
const XYPlot = require('../client/plots/xyplot');

var tradingDays = ['2016-08-29', '2016-08-30',
    '2016-08-31', '2016-09-01', '2016-09-02',
    '2016-09-03', '2016-09-04'
];

var data = [
	{symbol: 'XXX', open: 768.74, high: 774.99, low: 766.61, close: 772.15},
	{symbol: 'XXX', open: 769.33, high: 774.47, low: 766.84, close: 769.09},
	{symbol: 'XXX', open: 767.01, high: 769.09, low: 765.38, close: 767.05},
	{symbol: 'XXX', open: 769.25, high: 771.02, low: 764.30, close: 768.78},
	{symbol: 'XXX', open: 773.01, high: 773.92, low: 768.41, close: 771.46},
	{symbol: 'XXX', open: 773.45, high: 782.00, low: 771.00, close: 780.08},
	{symbol: 'XXX', open: 780.00, high: 782.73, low: 776.20, close: 780.35}
];

var data2 = [
	{symbol: 'YYY', open: 768.74, high: 764.99, low: 766.61, close: 772.15},
	{symbol: 'YYY', open: 769.33, high: 764.47, low: 766.84, close: 769.09},
	{symbol: 'YYY', open: 767.01, high: 789.09, low: 765.38, close: 767.05},
	{symbol: 'YYY', open: 769.25, high: 791.02, low: 764.30, close: 768.78},
	{symbol: 'YYY', open: 773.01, high: 820.92, low: 768.41, close: 771.46},
	{symbol: 'YYY', open: 773.45, high: 752.00, low: 771.00, close: 780.08},
	{symbol: 'YYY', open: 780.00, high: 772.73, low: 776.20, close: 780.35}
];

tradingDays.forEach( (item, index) => {
    data[index].tradingDay = item;
    data2[index].tradingDay = item;
});

var getRandData = function() {

};


document.addEventListener('DOMContentLoaded', () => {

    console.log('Setting up event listeners for buttons');

	var add1 = document.querySelector('#add1');
	var add2 = document.querySelector('#add2');
	var del1 = document.querySelector('#del1');
	var del2 = document.querySelector('#del2');

	add1.addEventListener('click', () => {
		plot.addData(data);
	});

	add2.addEventListener('click', () => {
		plot.addData(data2);
	});

	del1.addEventListener('click', () => {
		console.log('Removing data XXX');
		plot.removePlot('XXX');
	});

	del2.addEventListener('click', () => {
		console.log('Removing data YYY');
		plot.removePlot('YYY');
	});

    console.log('Starting to create the plot');
    var plot = new XYPlot('#plot', data);
    plot.addData(data2);
    console.log('Plot has been created');

});

