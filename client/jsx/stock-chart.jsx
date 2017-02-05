
'use strict';

const React = require('react');
const io = require('socket.io-client');
const XYPlot = require('../plots/xyplot.js');

/* Component which handles socket communication and instantiates the child
 * components for stock charting app.
 */
class StockChart extends React.Component {

    constructor(props) {
        super(props);

		this.addSym = this.addSym.bind(this);
		this.deleteSym = this.deleteSym.bind(this);
		this.onChange = this.onChange.bind(this);

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
    addSym() {
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

    deleteSym(e) {
        var elem = e.target;
        var symID = elem.getAttribute('id');
        console.log('deleteSym ID is ' + symID);

		var msg = {cmd: 'delSym', symbol: symID};
		this.socket.emit('client message', msg);

    }

	onChange(e) {
		var value = e.target.value;
		this.setState({symbol: value});

	}

    /* Open the socket connection to the client.*/
    componentDidMount() {
        this.socket = io();

        this.socket.on('server message', (msg) => {
            console.log('Got message from server: ' + msg);

            var newSymbol = msg.symbol;
            var symbols = this.state.symbols;

            if (msg.cmd === 'addSym') {
                if (msg.body !== null) {
                    symbols.push(newSymbol);
                    console.log('Got body: ' + msg.body);
                    var data = this.state.data;
                    var obj = JSON.parse(msg.body);
                    data[newSymbol] = msg.body;
                    if (this.plot === null) {
                        console.log('typeof body ' + typeof msg.body);
                        console.log('Results are ' + obj.results);
                        this.plot = new XYPlot('#plot-div', obj.results);
                    }
                    else {
                        this.plot.addData(obj.results, 'green');
                    }
                    this.setState({symbols: symbols, data: data, error: null});
                }
                else {
                    this.setState({error: 'No symbol found.'});
                }
            }
            else {
                var index = symbols.indexOf(newSymbol);
                symbols.splice(index, 1);
                this.setState({symbols: symbols});
            }
        });

    }

    render() {

        var keys = Object.keys(this.state.data);
        var dataElems = keys.map( (item, index) => {
            return (<p key={index} >Placeholder for {item} data.</p>);
        });

        var symbolElems = this.state.symbols.map( (item, index) => {
            return (
                <div className='sym-elem' key={index}>
                    Symbol: {item}
                    <button id={item} onClick={this.deleteSym} >Delete</button>
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
                <div id='plot-div'/>
                {dataElems}
                {symbolElems}
                {errorElem}
				<input name='input-sym' onChange={this.onChange} />
				<button onClick={this.addSym}>Add</button>
            </div>
        );

    }

}

module.exports = StockChart;
