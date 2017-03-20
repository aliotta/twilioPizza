try{

    var Promise        = require('bluebird');
    var tk;
    require('dotenv').load();
    var express         = require('express');
    var http            = require('http');
    var cors            = require('cors');
    var app             = express();
    var Q               = require('q');
    var bodyParser      = require('body-parser');
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
            deferred.resolve(app);
        });
        return deferred.promise;
    };

    require('./routes/twilio')(app,express);

    boot();

} catch (err){
    console.log("ERROR", err);
    throw err;
}
