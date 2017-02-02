
'use strict';

const React = require('react');
const io = require('socket.io-client');

class StockChart extends React.Component {

    constructor(props) {
        super(props);

		this.addSym = this.addSym.bind(this);
		this.deleteSym = this.deleteSym.bind(this);
		this.onChange = this.onChange.bind(this);

		this.state = {
            symbol: null,
            symbols: []
		};
    }

    /* Adds one stock symbol for the app. */
    addSym() {
		var msg = {cmd: 'addSym', symbol: this.state.symbol};
		this.socket.emit('client message', msg);

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
                symbols.push(newSymbol);
            }
            else {
                var index = symbols.indexOf(newSymbol);
                symbols.splice(index, 1);

            }
            this.setState({symbols: symbols});
        });

    }

    render() {

        var symbolElems = this.state.symbols.map( (item, index) => {
            return (
                <div className='sym-elem' key={index}>
                    Symbol: {item}
                    <button id={item} onClick={this.deleteSym} >Delete</button>
                </div>

            );
        });

        return (
            <div>
                {symbolElems}
				<div id='server-resp'>No messages</div>
				<input name='input-sym' onChange={this.onChange} />
				<button onClick={this.addSym}>Add</button>
            </div>
        );

    }

}

module.exports = StockChart;
