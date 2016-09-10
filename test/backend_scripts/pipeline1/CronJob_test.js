var assert                          = require('chai').assert,
    expect                          = require('chai').expect,
    request                         = require('supertest'),
    tk                              = require('timekeeper'),
    child_process                   = require('child_process'),
    cronJobWorker,
    startingTime                    = new Date().setHours(0,0,0,0), // today @ 00:00:00 PM GMT-7:00 DST in milliseconds
    day_of_week_today               = new Date(startingTime).getDay(),
    time1                           = new Date(startingTime + 47 * 60 * 60 * 1000 - 1000 + 20 * 60 * 1000), // tomorrow @ 3:59:59 PM GMT-7:00 DST
    time2                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow @ 4:00:00 PM GMT-7:00 DST
    time3                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow @ 4:00:01 PM GMT-7:00 DST
    time4                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow @ 4:00:00 PM GMT-7:00 DST
    time5                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow @ 4:00:01 PM GMT-7:00 DST
require('dotenv').load();
var serviceTimeObj, kitchen, kitchen_id;

var now = new Date();

describe('Cron Jobs',function(){

    beforeEach(function(done){
        done();
    });

    before(function(done) {  
        done();
    });

    after(function(done) {
        done();
    });

    describe('Cron Job', function() {
        var cronJobWorker;
        var count = 0;
        function cleanUp() {
            if(cronJobWorker) {
                cronJobWorker.kill();
                cronJobWorker = null;
            }
        }

        process.on('exit', function() {
            cleanUp();
        });

        process.on('SIGTERM', function() {
            cleanUp();
        });

        process.on('SIGINT', function() {
           cleanUp();
        });

        initialized = false;
        
        before(function(done){
            cronJobWorker = child_process.fork('./clockWorker', null, {env:process.env});
            tk.travel(time1);
            cronJobWorker.send({change_time: time1});
            cronJobWorker.on('message', function(data) {
                if(data.jobStatus === 'initialized'){
                    if(!initialized){
                        initialized = true;
                        cronJobWorker.send({jobStatus: 'boot'});
                    }
                }

                if(data.jobStatus === 'server_booted'){
                    console.log("BOOTY");
                    done();
                }
            });
        });

        describe('Executes a scheduled cron job once <per></per> day', function() {
            it('Executes a scheduled cron job', function(done) {
                cronJobWorker.on('message', function(data) {
                    if(data.jobStatus === 'called'){
                        count++
                    }

                    if(count === 2 ){//2){
                        done();
                    }
                });
                tk.travel(time2);
                cronJobWorker.send({change_time: time2});
                tk.travel(time3);
                cronJobWorker.send({change_time: time3});
                // tk.travel(time4);
                // cronJobWorker.send({change_time: time4});
                // tk.travel(time5);
                // cronJobWorker.send({change_time: time5});
            });

        });
    });
});