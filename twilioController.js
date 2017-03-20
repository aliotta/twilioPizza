module.exports = {orderPizza: orderPizza};
var rp                  = require('request-promise');
var apigClientFactory   = require('aws-api-gateway-client');
var Promise             = require('bluebird');

function orderPizza(){
    var apigClient = apigClientFactory.newClient({
        accessKey: process.env.ACCESS_KEY,
        secretKey: process.env.SECRET_KEY,
        invokeUrl:process.env.URL,
        region: process.env.REGION // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
    });

    var params = {
        //This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API
        //userId: '1234',
    };
    // Template syntax follows url-template https://www.npmjs.com/package/url-template
    var pathTemplate = '/create'
    var method = 'POST';
    var additionalParams = {
        // //If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
        // headers: {
        //     param0: '',
        //     param1: ''
        // },
        // queryParams: {
        //     param0: '',
        //     param1: ''
        // }
    };
    var body = {
        //This is where you define the body of the request
    };
     
    return apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
        console.log("Success", result);
        return result;
        //This is where you would put a success callback
    }).catch( function(result){
        console.log("ERROR", result)
        //This is where you would put an error callback
    });
}