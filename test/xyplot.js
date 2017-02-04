
const XYPlot = require('../client/plots/xyplot');


var data = [
	{symbol: 'XXX', tradingDay: '2016-08-29', open: 768.74, high: 774.99, low: 766.61, close: 772.15},
	{symbol: 'XXX', tradingDay: '2016-08-30', open: 769.33, high: 774.47, low: 766.84, close: 769.09},
	{symbol: 'XXX', tradingDay: '2016-08-31', open: 767.01, high: 769.09, low: 765.38, close: 767.05},
	{symbol: 'XXX', tradingDay: '2016-09-01', open: 769.25, high: 771.02, low: 764.3, close: 768.78},
	{symbol: 'XXX', tradingDay: '2016-09-02', open: 773.01, high: 773.92, low: 768.41, close: 771.46},
	{symbol: 'XXX', tradingDay: '2016-09-03', open: 773.45, high: 782, low: 771, close: 780.08},
	{symbol: 'XXX', tradingDay: '2016-09-04', open: 780, high: 782.73, low: 776.2, close: 780.35}
];

var data2 = [
	{symbol: 'YYY', tradingDay: '2016-08-29', open: 768.74, high: 764.99, low: 766.61, close: 772.15},
	{symbol: 'YYY', tradingDay: '2016-08-30', open: 769.33, high: 764.47, low: 766.84, close: 769.09},
	{symbol: 'YYY', tradingDay: '2016-08-31', open: 767.01, high: 789.09, low: 765.38, close: 767.05},
	{symbol: 'YYY', tradingDay: '2016-09-01', open: 769.25, high: 791.02, low: 764.3, close: 768.78},
	{symbol: 'YYY', tradingDay: '2016-09-02', open: 773.01, high: 820.92, low: 768.41, close: 771.46},
	{symbol: 'YYY', tradingDay: '2016-09-03', open: 773.45, high: 752.00, low: 771, close: 780.08},
	{symbol: 'YYY', tradingDay: '2016-09-04', open: 780.00, high: 772.73, low: 776.2, close: 780.35}
];

console.log('Setting up window onLoad');

console.log('Starting to create the plot');
var plot = new XYPlot('#plot', data);

plot.addData(data2, 'green');

console.log('Plot has been created');

