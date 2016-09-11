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
    time4                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow + 1 @ 4:00:00 PM GMT-7:00 DST
    time5                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow + 1 @ 4:00:01 PM GMT-7:00 DST
    time6                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow +2 @ 4:00:00 PM GMT-7:00 DST
    time7                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 2 * 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow +2 @ 4:00:01 PM GMT-7:00 DST
    time8                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow +3 @ 4:00:00 PM GMT-7:00 DST
    time9                           = new Date(startingTime + 47 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow +3 @ 4:00:01 PM GMT-7:00 DST
    time10                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow +4 @ 4:00:00 PM GMT-7:00 DST
    time11                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 4 * 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow +4 @ 4:00:01 PM GMT-7:00 DST
    time12                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow +5 @ 4:00:00 PM GMT-7:00 DST
    time13                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 5 * 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow +5 @ 4:00:01 PM GMT-7:00 DST
    time14                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 6 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // tomorrow +6 @ 4:00:00 PM GMT-7:00 DST
    time15                          = new Date(startingTime + 47 * 60 * 60 * 1000 + 6 * 24 * 60 * 60 * 1000 + 1000 + 20 * 60 * 1000); // tomorrow +6 @ 4:00:01 PM GMT-7:00 DST
require('dotenv').load();
var serviceTimeObj, kitchen, kitchen_id;

var now = new Date();
var cronJobWorker;
var count;
var initialized;

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
        count = 0;
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
            process.env.DONT_CALL = true;
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

        after(function(){
            tk.travel(time1);
            cronJobWorker.send({change_time: time1});
            delete process.env.DONT_CALL;
            cleanUp();
        })

        describe('Executes a scheduled cron job once <per></per> day', function() {
            it('Executes a scheduled cron job', function(done) {
                cronJobWorker.on('message', function(data) {
                    if(data.jobStatus === 'called'){
                        count++
                        if(count === 1 ){
                            done();
                        }
                    }
                    
                });
                tk.travel(time2);
                cronJobWorker.send({change_time: time2});
                tk.travel(time3);
                cronJobWorker.send({change_time: time3});
                //extra time travel just in case its the weekend
                tk.travel(time4);
                cronJobWorker.send({change_time: time4});
                tk.travel(time5);
                cronJobWorker.send({change_time: time5});
                tk.travel(time6);
                cronJobWorker.send({change_time: time6});
                tk.travel(time7);
                cronJobWorker.send({change_time: time7});
            });

            it('Route returns properly formated xml', function(done){
                url = 'http://localhost:5000/twilio';
                request(url)
                .get('/')
                .expect(200)
                .end(function(err, res) {
                    if(err) return done(err);
                    console.log('RESP',res.text);
                    done();
                });
            });

        });
    });

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

        describe('days of the week', function() {
            count = 0;
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

            
            before(function(done){
                initialized = false;

                process.env.DONT_CALL = true;
                process.env.NUM_CALLS = 0;
                cronJobWorker = child_process.fork('./clockWorker', null, {env:process.env});
                tk.travel(time1);
                cronJobWorker.send({change_time: time1});
                cronJobWorker.on('message', function(data) {
                    if(data.jobStatus === 'initialized'){
                        if(!initialized){
                            initialized = true;
                            done();
                        }
                    }

                });
            });

            after(function(){
                delete process.env.NUM_CALLS;
                delete process.env.DONT_CALL;
                cleanUp();
            })

            describe('days of the week', function() {
                
                it('Executes 5 days a week ie not the weekend', function(done){
                    count = 0;

                    cronJobWorker.on('message', function(data) {
                        if(data.jobStatus === 'called_five_times'){
                            expect(data.count).to.equal('5');
                            done();
                        }
                    });
                    
                    tk.travel(time2);
                    cronJobWorker.send({change_time: time2});
                    tk.travel(time3);
                    cronJobWorker.send({change_time: time3});

                    tk.travel(time4);
                    cronJobWorker.send({change_time: time4});
                    tk.travel(time5);
                    cronJobWorker.send({change_time: time5});

                    tk.travel(time6);
                    cronJobWorker.send({change_time: time6});
                    tk.travel(time7);
                    cronJobWorker.send({change_time: time7});

                    tk.travel(time8);
                    cronJobWorker.send({change_time: time8});
                    tk.travel(time9);
                    cronJobWorker.send({change_time: time9});

                    tk.travel(time10);
                    cronJobWorker.send({change_time: time10});
                    tk.travel(time11);
                    cronJobWorker.send({change_time: time11});

                    tk.travel(time12);
                    cronJobWorker.send({change_time: time12});
                    tk.travel(time13);
                    cronJobWorker.send({change_time: time13});

                    tk.travel(time14);
                    cronJobWorker.send({change_time: time14});
                    tk.travel(time15);
                    cronJobWorker.send({change_time: time15});
                });

            });
        });
    });
});