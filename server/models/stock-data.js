
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var StockSchema = new Schema({

    symbol: {
        required: true,
        type: String
    },

    data: {
        required: true,
        type: [Object]
    }

},
{collection: 'stocks'}
);

module.exports = mongoose.model('Stock', StockSchema);
