
'use strict';

const ReactDOM = require('react-dom');
const React = require('react');
const StockChart = require('./stock-chart.jsx');

var main = document.querySelector('#main-app');

if (main) {
    ReactDOM.render(<StockChart />, main);
}

