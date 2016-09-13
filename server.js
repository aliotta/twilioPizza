try{

    var Promise        = require('bluebird');
    var schedule       = require('node-schedule');
    var tk;
    if(process.env.LOCAL_TESTING){
        require('dotenv').load();
    }

    var express         = require('express'),
        http            = require('http'),
        cors            = require('cors'),
        app             = express(),
        Q               = require('q'),
        bodyParser      = require('body-parser');
    var port = process.env.PORT || 5000;
    var placeCall = require('./twilioController').placeCall;

    //SERVER
    app.use(cors());
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
            console.log('Express server listening on port ' + port);
            if(process.env.LOCAL_TESTING === 'TRUE' && !process.env.BOOT){
                process.send({jobStatus: 'server_booted'})
            }
            deferred.resolve(app);
        });
        return deferred.promise;
    };

    require('./routes/twilio')(app,express);

    if (process.env.LOCAL_TESTING && !process.env.BOOT) {
        process.on('message', function(data) {
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

    //CRON JOBS

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
            var hour = process.env.CALL_HOUR;
            var minute = process.env.CALL_MINUTE;
            var dailyCronJob = schedule.scheduleJob(
                '0 ' + minute + ' ' + hour + ' * * 1,2-5',
                function() {
                    sendToTestingEnv({ jobStatus: 'daily_scheduler_executed' });
                    console.log("Daily Job Executed");
                    placeCall();
                }
            );
            console.log('Daily Job Scheduled');
            sendToTestingEnv({ jobStatus: 'initialized' });
        } catch(err) {
            console.log("cron pattern not valid", err);
        }
    }

    function sendToTestingEnv(msg){
        if(process.env.LOCAL_TESTING === 'TRUE' && !process.env.BOOT){
            process.send(msg);
        }
    }
} catch (err){
    console.log("ERROR", err);
    throw err;
}
