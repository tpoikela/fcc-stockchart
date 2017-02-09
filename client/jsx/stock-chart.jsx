
'use strict';

const React = require('react');
const io = require('socket.io-client');
const XYPlot = require('../plots/xyplot.js');
const TimeSpanElem = require('./time-span-elem.jsx');


/* Component which handles socket communication and instantiates the child
 * components for stock charting app.
 */
class StockChart extends React.Component {

    constructor(props) {
        super(props);

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

    /* Deletes a plot.*/
    onClickDelete(e) {
        var elem = e.target;
        var symID = elem.getAttribute('id');
        console.log('onClickDelete symbol ID is ' + symID);

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
            console.log('Got message from server: ' + msg);
            this.handleServerCmd(msg);

        });

    }

    /* Processes the command from the server. Adds/deletes a plot.*/
    handleServerCmd(msg) {
        var newSymbol = msg.symbol;
        var symbols = this.state.symbols;

        if (!newSymbol) {
            var err = 'msg.symbol is undefined.';
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
                    console.log('typeof body ' + typeof msg.body);
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
        console.log('Changing time span to ' + text);
        this.plot.setRangeX(text);
        this.setState({msg: 'Range updated.'});
    }

    setAxisTypeY(e) {
        var btn = e.target;
        var text = btn.textContent;
        console.log('Changing Y axis to ' + text);
        this.plot.setAxisTypeY(text);
        this.setState({msg: 'Range updated.'});
    }

    /* Renders component and all its sub-components.*/
    render() {

        var symbolElems = this.state.symbols.map( (item, index) => {
            return (
                <div className='sym-elem' key={index}>
                    Symbol: {item}
                    <button id={item} onClick={this.onClickDelete}>
                        Delete
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
                <TimeSpanElem onClick={this.changeTimeSpan}/>
                <button onClick={this.setAxisTypeY}>growth</button>
                <button onClick={this.setAxisTypeY}>high</button>
                <button onClick={this.setAxisTypeY}>low</button>
                <div id='plot-div'/>
                {symbolElems}
                {errorElem}
				<input name='input-sym' onChange={this.onChange} />
				<button onClick={this.onClickAdd}>Add</button>
            </div>
        );

    }

}

module.exports = StockChart;
