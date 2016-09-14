//this worker is used to awkaken the sleeping heroku app

var url = process.env.HOSTED_URL;
var request = require('request');
request(url + '/twilio', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("TESTING RAKE: ", response)
    }

    if(error){
        console.log('there was an error waking the sleeping giant: ', error);
    }
})