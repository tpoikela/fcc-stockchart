
'use strict';

const React = require('react');
const io = require('socket.io-client');
const XYPlot = require('../plots/xyplot.js');
const TimeSpanElem = require('./time-span-elem.jsx');
const PriceTypeElem = require('./price-type-elem.jsx');
const AuthorFooter = require('./author-footer.jsx');

/* Component which handles socket communication and instantiates the child
 * components for stock charting app.
 */
class StockChart extends React.Component {

    constructor(props) {
        super(props);

        this.verbosity = 1;

		this.onClickAdd = this.onClickAdd .bind(this);
		this.onClickDelete = this.onClickDelete.bind(this);
		this.onChange = this.onChange.bind(this);
        this.changeTimeSpan = this.changeTimeSpan.bind(this);
        this.setAxisTypeY = this.setAxisTypeY.bind(this);

        this.plot = null;

		this.state = {
            error: null,
            symbol: null, // Each stock is id'ed by its symbol
            symbols: [],
            data: {}
		};
    }

    /* Adds one stock symbol for the app. Produces error message if symbol
     * already exist. */
    onClickAdd() {
        var symbol = this.state.symbol;
        if (symbol && symbol.length > 0) {
            var index = this.state.symbols.indexOf(symbol);
            if (index < 0) {
                var msg = {cmd: 'addSym', symbol: symbol};
                this.socket.emit('client message', msg);
            }
            else {
                var err = 'Symbol ' + symbol + ' already exists.';
                this.setState({error: err});
            }
        }

    }

    /* Deletes a plot and its data. Sends message to the server. */
    onClickDelete(e) {
        var elem = e.target;
        var symID = elem.getAttribute('id');
        this.logMsg('onClickDelete symbol ID is ' + symID);

		var msg = {cmd: 'delSym', symbol: symID};
		this.socket.emit('client message', msg);

    }

    /* Handler for stock symbol input field.*/
	onChange(e) {
		var value = e.target.value;
		this.setState({symbol: value});
	}

    /* Open the socket connection to the client.*/
    componentDidMount() {
        this.socket = io();

        this.socket.on('server message', (msg) => {
            this.logMsg('Got message from server: ' + msg);
            this.handleServerCmd(msg);

        });

    }

    /* Processes the command from the server. Adds/deletes a plot.*/
    handleServerCmd(msg) {
        var newSymbol = msg.symbol;
        var symbols = this.state.symbols;

        if (!newSymbol) {
            var err = 'Symbol was not found.';
            this.setState({error: err});
            return;
        }

        if (msg.cmd === 'addSym') {
            if (msg.body !== null) {
                symbols.push(newSymbol);
                var data = this.state.data;
                var obj = JSON.parse(msg.body);
                data[newSymbol] = msg.body;

                // If 1st plot, create new object,
                if (this.plot === null) {
                    this.plot = new XYPlot('#plot-div', obj.results);
                }
                else {
                    this.plot.addData(obj.results);
                }

                this.setState({symbols: symbols, data: data, error: null});
            }
            else {
                this.setState({error: 'Cannot add. msg.body null.'});
            }
        }
        else {
            var index = symbols.indexOf(newSymbol);
            if (index >= 0) {
                symbols.splice(index, 1);
                this.plot.removePlot(newSymbol);
                this.setState({symbols: symbols});
            }
            else {
                this.setState({error: 'Cannot delete. No symbol found.'});
            }
        }
    }

    changeTimeSpan(e) {
        var btn = e.target;
        var text = btn.textContent;
        this.logMsg('Changing time span to ' + text);
        this.plot.setRangeX(text);
        this.setState({msg: 'Range updated.'});
    }

    setAxisTypeY(e) {
        var btn = e.target;
        var text = btn.textContent;
        this.logMsg('Changing Y axis to ' + text);
        this.plot.setAxisTypeY(text);
        this.setState({msg: 'Range updated.'});
    }

    /* Renders component and all its sub-components.*/
    render() {

        var symbolElems = this.state.symbols.map( (item, index) => {
            var colorName = this.plot.getColor(item);
            var colorStyle = {color: colorName, fontWeight: 900, fontSize: 40};
            return (
                <div className='sym-elem' key={index}>
                    {item} <span style={colorStyle}>--</span>
                    <button className='sym-elem-btn btn-danger' id={item}
                        onClick={this.onClickDelete}
                        >
                        X
                    </button>
                </div>
            );
        });

        var errorElem = null;
        if (this.state.error) {
            errorElem = (
                <p className='text-danger'>ERROR: {this.state.error}</p>
            );
        }

        return (
            <div>
                <h1>StockCharts:</h1>
                <TimeSpanElem onClick={this.changeTimeSpan}/>
                <PriceTypeElem onClick={this.setAxisTypeY}/>

                <div id='plot-div'/>
                <div className='sym-elems-div'>
                    {symbolElems}
                </div>
                {errorElem}
                Stock symbol: <input className='input input-sym'
                    name='input-sym' onChange={this.onChange}
                    placeholder='Stock symbol (ie. NKA)'
                />
				<button onClick={this.onClickAdd}>Add</button>
                <AuthorFooter/>
            </div>
        );

    }


    logMsg(msg, verb) {
        if (verb <= this.verbosity) {
            console.log('[INFO] ' + msg);
        }
    }

}

module.exports = StockChart;
