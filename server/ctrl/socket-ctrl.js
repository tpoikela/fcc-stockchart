
'use strict';

/* Socket controller which handles all socket connections from clients. */
class SocketCtrl {

    constructor(io, barchart, stockData) {

        this.io = io;
        this.stockData = stockData;
        this.barchart = barchart;
        this.verbosity = 1;

        this.processClientMsg = this.processClientMsg.bind(this);

        // Listens to incoming client connections
        this.io.on('connection', (socket) => {
            this.logInfo('A user connected.');

            var symbols = Object.keys(stockData);
            symbols.forEach( (item) => {
                var msg = {body: stockData[item], cmd: 'addSym'};
                msg.symbol = item;
                socket.emit('server message', msg);
            });


            socket.on('client message', this.processClientMsg);
        });
    }

    /* Process addSym/delSym commands from clients.*/
    processClientMsg(msg) {
        var stockData = this.stockData;
        var barchart = this.barchart;
        this.logInfo('Server got message: ' + JSON.stringify(msg));
        if (msg.cmd === 'addSym') {
            var startDate = this.getStartDate(372);
            var query = {
                symbol: msg.symbol,
                type: 'daily',
                startDate: startDate
            };

            barchart.getHistory(query, (err, res, body) => {
                if (err) {
                    this.emitError('An error occurred');
                }
                else {
                    var bodyObj = JSON.parse(body);

                    var code = bodyObj.status.code;
                    this.logInfo('Response status.code: ' + code);

                    if (code === 200) {
                        var newMsg = Object.assign({}, msg);
                        newMsg.body = body;
                        this.emit(newMsg);
                        this.stockData[msg.symbol] = newMsg.body;
                    }
                    else if (code === 204) {
                        var errorMsg = 'No symbol ' + msg.symbol + ' found.';
                        this.emitErrr(errorMsg);
                    }
                }

            });
        }
        else {
            // Emit the delSym without modifications
            var symbol = msg.symbol;
            if (stockData.hasOwnProperty(symbol)) {
                this.emit(msg);
                delete stockData[symbol];
            }
            else {
                this.logError('Symbol ' + symbol + ' does not exist.');
            }
        }

    }

    /* Returns date N days from today. */
    getStartDate(nDays) {
        var dateNow = new Date();
        var dateStartMs = dateNow.getTime() - 1000 * 3600 * 24 * nDays;
        var dateStart = new Date(dateStartMs);
        var year = '' + dateStart.getFullYear();
        var month = (dateStart.getMonth() + 1);
        if (month < 10) {
            month = '0' + month;
        }
        var day = '' + dateStart.getDate();
        var result = year + month + day + '000000';
        this.logInfo('getStartDate result: ' + result);
        return result;
    }

    emit(msg) {
        this.io.emit('server message', msg);
    }

    emitError(errorMsg) {
        this.io.emit('server message', {error: errorMsg});
    }

    logError(msg) {
        console.error('SocketCtrl [ERROR]: ' + msg);
    }

    logInfo(msg, verb = 1) {
        if (this.verbosity >= verb) {
            console.log('SocketCtrl [INFO]: ' + msg);
        }
    }

}

module.exports = SocketCtrl;
