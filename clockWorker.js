var Promise        = require('bluebird');
var schedule       = require('node-schedule');
var tk;
var twilioAPIsid   = process.env.TWILIO_API_SID;
var twilioAPIauth  = process.env.TWILIO_API_AUTH;
var twilio = require('twilio');
var twiml = new twilio.TwimlResponse();

var express         = require('express'),
    http            = require('http'),
    app             = express(),
    Q               = require('q'),
    bodyParser      = require('body-parser');
var port = process.env.PORT || 5000;

//SERVER

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// =======================
// start the server ======
// =======================

var server = http.createServer(app);
app.instance = undefined;

var boot = function () {
    var deferred = Q.defer();
    app.instance = server.listen(port, function(){
        console.info('Express server listening on port ' + port);
        if(process.env.LOCAL_TESTING === 'TRUE'){
            process.send({jobStatus: 'server_booted'})
        }
        deferred.resolve(app);
    });
    return deferred.promise;
};

require('./routes/twilio')(app,express);

if (process.env.LOCAL_TESTING) {
    process.on('message', function(data) {
        console.log("HEARD", data)
        if(data.jobStatus === 'boot'){
            boot();
        } else if (data.jobStatus === 'shutdown'){
            shutdown();
        }
    });
}

else {
    boot();
}

//WORKER
twiml.say('hello', { voice: 'alice'});

//require the Twilio module and create a REST client
var client = twilio(twilioAPIsid, twilioAPIauth);

'use strict;';

startCronJobs();

function startCronJobs() {
    'use strict;';
    var request                  = require('request'),
    initialized                  = false;

    if(process.env.LOCAL_TESTING === 'TRUE'){
        if (!tk){
            tk = require('timekeeper');
        }
        process.on('message', function(data) {
            console.log('Old Testing Time: ', new Date());
            if(data.change_time){
                tk.travel(data.change_time);
                console.log('New Testing Time: ', new Date());
            }
            if(!initialized){
                initialized = true;
                startCronForTwilio();
            }
        });
    } else {
        //Schedule the scheduler everytime the process boots to ensure execution
        startCronForTwilio();
    }
}

function startCronForTwilio(kitchen_id){
    try {
        var rule = new schedule.RecurrenceRule();
        rule.hour = 23; // this will execute at 4:20 PM PST everyday
        rule.minute = 20;
        var dailyCronJob = schedule.scheduleJob(
            rule,
            function() {
                sendToTestingEnv({ jobStatus: 'daily_scheduler_executed' });
                console.log("Daily Job Executed");
                callJourdan();
            }
        );
        console.log('Daily Job Scheduled');
        sendToTestingEnv({ jobStatus: 'initialized' });
    } catch(err) {
        console.log("cron pattern not valid", err);
    }
}

function callJourdan(){
    var url;
    var to;
    if(process.env.LOCAL_TESTING){
        to = '+19084894919';
        url = 'http://127.0.0.1:5000/twilio';
    } else {
        to = '+19084894919';
        url = 'http://127.0.0.1:5000/twilio';
    }
    console.log('calling Jourdan');
    if(process.env.LOCAL_TESTING === 'TRUE'){
        sendToTestingEnv({ jobStatus: 'called' });
        //Place a phone call, and respond with TwiML instructions from the given URL
        client.makeCall({

            to: to, // Any number Twilio can call
            from: '+17327599398 ', // A number you bought from Twilio and can use for outbound communication
            url: url // A URL that produces an XML document (TwiML) which contains instructions for the call

        }, function(err, responseData) {

            //executed when the call has been initiated.
            console.log(responseData, err); // outputs "+14506667788"

        });
    } else {

    }
}

function sendToTestingEnv(msg){
    if(process.env.LOCAL_TESTING === 'TRUE'){
        process.send(msg);
    }
}