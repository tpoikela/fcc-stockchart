
'use strict';

var path = process.cwd();

module.exports = function(app) {

    app.route('/')
        .get((req, res) => {
        res.sendFile(path + '/public/index.html');
    });

};
