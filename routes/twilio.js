var bodyParser          = require('body-parser');
var twilio              = require('twilio');
var twilioController    = require('../twilioController');


module.exports = function (app, express) {
    'use strict';

    var api                 = express.Router();
    var options = {
        method: 'POST',
        uri: process.env.URL,
        body: {},
        json: true // Automatically stringifies the body to JSON
    };
    // Get twiml
    api.post('/', function (request, response) {
        twilioController.orderPizza()
        .then(function(res){
            console.log("SUCCESSS?", res);
            if(res && res.data && res.data.errorMessage){
                throw new Error('Unsuccessful: ' + res.data.errorMessage);
            };
            response.set('Content-Type','text/xml');
            response.send('<Response><Message>Pizza is on the way</Message></Response>');
        })
        .catch(function(err){
            console.log("YEAH FIGURES", err);
            response.send('<Response><Message>There was an error.</Message></Response>');
        });

    });

    app.use(bodyParser.json());

    app.use('/twilio', api);

};