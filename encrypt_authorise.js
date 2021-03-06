const express = require('express');
const app = express();
const mysql = require('mysql');
const request = require('request');
const querystring = require('querystring');
const https = require('https');
const fs = require('fs');

// This module is the backend for Adyen iOS SDK: a user inputs credit card information that's encrypted in the app then sent through 
// a secure connection to this server before authenticating to Adyen's service in order to authorise a payment.

app.get("/payment/:card/", (req, res) => {
    const card_encrypted_json = req.params.card;
        //   const street = req.params.street;
        //   const city = req.params.city;
        //   const postcode = req.params.postcode;
        //   const country = req.params.country;

        const apiUrl = 'pal-test.adyen.com';
        const pathUrl = '/pal/servlet/Payment/v30/authorise';
        const user = 'xxx';
        const pass = 'xxx';
        const auth = 'Basic ' + new Buffer(user + ':' + pass).toString('base64');

        const data = {
            "additionalData": {
                "card.encrypted.json": card_encrypted_json
            },

            "amount": {
                "value": 0,  // zero-value card verification
                "currency": "EUR"
            },
            //      "billingAddress": {
            //         "city": city,
            //         "country": country,
            //         "postalCode": postcode,
            //         "street": street
            //     },
            "reference": generateOrderNumber(),
            "merchantAccount": "xxx",
            "origin": req.url
        }


        const requestHeaders = {
            'Content-Type': 'application/json',
            'Authorization': auth
        };

        console.log(`Headers: ${JSON.stringify(requestHeaders)}`);

        const options = {
            host: apiUrl,
            path: pathUrl,
            method: 'POST',
            headers: requestHeaders
        };



        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // allow unsafe connections

        var newRequest = https.request(options, (resp) => {
            console.log(`STATUS: ${res.statusCode}`);

            console.log(`HEADERS: ${JSON.stringify(resp.headers)}`);
            resp.setEncoding('utf8');
            resp.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
                //res.json(chunk);
                res.send(JSON.stringify(chunk));
            });

            resp.on('end', () => {
                console.log('No more data in response.');
            });
        });

    newRequest.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    const dataString = JSON.stringify(data);
    console.log(dataString);

        newRequest.write(dataString);
        newRequest.end();




});


    function generateOrderNumber() {
        // generates an arbitrary 9-figure order number
        let string = "0123456789";
        var randomString = "";
        for (var i = 0; i < 9; i++) {
            randomString += String(Math.floor((Math.random() * 10))); // generate a random number between 1 and 10
        }

        return randomString;
    };

var privateKey = fs.readFileSync('key.pem').toString();
var certificate = fs.readFileSync('server.crt').toString();


https.createServer({
    key: privateKey,
    cert: certificate,

}, app).listen(808);
