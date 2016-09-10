var bodyParser          = require('body-parser');

module.exports = function (app, express) {
    'use strict';

    var api                 = express.Router();

    // Get Variable
    api.get('/', function (req, res) {
        console.log("HEARD YA")
    });

    app.use(bodyParser.json());

    app.use('/twilio', api);

};