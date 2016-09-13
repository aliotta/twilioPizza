module.exports = {placeCall: placeCall};
var counter = 0;
var twilio = require('twilio');
var twiml = new twilio.TwimlResponse();
var twilioAPIsid   = process.env.TWILIO_API_SID;
var twilioAPIauth  = process.env.TWILIO_API_AUTH;
var client = twilio(twilioAPIsid, twilioAPIauth);
var ngrok           = require('ngrok');
var ngrokToken     = process.env.NGROK_KEY;
var ngrokURL;
var port = process.env.PORT || 5000;
if(process.env.LOCAL_TESTING){
    //expose local host to web
    ngrok.connect({
        proto: 'http', // http|tcp|tls 
        addr: port, // port or network address 
        authtoken: ngrokToken, // your authtoken from ngrok.com 
        region: 'us' // one of ngrok regions (us, eu, au, ap), defaults to us 
    }, function (err, url) {
        ngrokURL = url;
        if(process.env.CALL_NOW){
            placeCall();
        }
    });
}

function placeCall(){
    counter++;
    var url;
    var to;
    if(process.env.LOCAL_TESTING){
        to = '+19084894919';
        url = ngrokURL;
    } else {
        to = process.env.TO_PHONE_NUMBER;
        url = process.env.HOSTED_URL; //TODO prob a better way to do this
    }
    if(process.env.DONT_CALL !== 'true'){
        sendToTestingEnv({ jobStatus: 'called' });
        //Place a phone call, and respond with TwiML instructions from the given URL
        client.makeCall({

            to: to, // Any number Twilio can call
            from: '+17327599398 ', // A number you bought from Twilio and can use for outbound communication
            url: url + '/twilio' // A URL that produces an XML document (TwiML) which contains instructions for the call

        }, function(err, responseData) {
            console.log('hmmm', responseData, url, to, err)
            //executed when the call has been initiated.
            //console.log(responseData, err); // outputs "+14506667788"

        });
    } else {
        if(process.env.NUM_CALLS !== undefined){
            process.env.NUM_CALLS = 1 + parseInt(process.env.NUM_CALLS);
        }
        sendToTestingEnv({ jobStatus: 'called' });
    }
    if(counter === 5 && process.env.NUM_CALLS){
        setTimeout(function(){
            sendToTestingEnv({ jobStatus: 'called_five_times', count: process.env.NUM_CALLS });
        },4000)
    }
}

function sendToTestingEnv(msg){
    if(process.env.LOCAL_TESTING === 'TRUE' && !process.env.BOOT){
        process.send(msg);
    }
}