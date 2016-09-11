var bodyParser          = require('body-parser');
var twilio = require('twilio');

module.exports = function (app, express) {
    'use strict';

    var api                 = express.Router();

    // Get Variable
    api.get('/', function (request, response) {
        response.set('Content-Type','text/xml');
        var twiml = new twilio.TwimlResponse();
        twiml.say('Hello', { voice: 'alice'});
        console.log('SHA', twiml.toString())
        response.send(twiml.toString());
    });

    app.use(bodyParser.json());

    app.use('/twilio', api);

};