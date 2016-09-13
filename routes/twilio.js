var bodyParser          = require('body-parser');
var twilio = require('twilio');
var placeCall = require('../twilioController').placeCall;

module.exports = function (app, express) {
    'use strict';

    var api                 = express.Router();

    // Get twiml
    api.post('/', function (request, response) {
        response.set('Content-Type','text/xml');
        var twiml = new twilio.TwimlResponse();
        twiml.say('Hello is this Jordan?', { voice: 'man'});
        twiml.record({maxLength:"45", transcribe:true, playBeep:"false"})
        console.log('SHA', twiml.toString())
        response.send(twiml.toString());
    });

    // Make a call on demand
    api.post('/callNow', function (request, response) {
        console.log(request.body)
        if(request.body.auth === process.env.LIOTTA_AUTH){
            placeCall();
            response.json({success: true});
        } else {
            response.json({success: false});
        }
    });

    app.use(bodyParser.json());

    app.use('/twilio', api);

};