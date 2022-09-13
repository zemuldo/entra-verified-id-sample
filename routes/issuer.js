const express = require('express')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const uuid = require('uuid');

const config = require('../config/vc')
const msal = require('../config/msal');
const sessionStore = require('../config/session');

const router = express()

let requestConfigFile = process.argv.slice(2)[1];
if (!requestConfigFile) {
    requestConfigFile = process.env.ISSUANCEFILE || '../config/issuance_request_config.json';
}
const issuanceConfig = require(requestConfigFile);
issuanceConfig.registration.clientName = "Node.js SDK API Issuer";

issuanceConfig.authority = config["IssuerAuthority"]
issuanceConfig.manifest = config["CredentialManifest"]
if (issuanceConfig.pin && issuanceConfig.pin.length == 0) {
    issuanceConfig.pin = null;
}
const apiKey = uuid.v4();
if (issuanceConfig.callback.headers) {
    issuanceConfig.callback.headers['api-key'] = apiKey;
}

function generatePin(digits) {
    var add = 1, max = 12 - add;
    max = Math.pow(10, digits + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;
    return ("" + number).substring(add);
}

router.get('/issuance-request', async (req, res) => {
    var id = req.session.id;
    // prep a session state of 0
    sessionStore.get(id, (error, session) => {
        var sessionData = {
            "status": 0,
            "message": "Waiting for QR code to be scanned"
        };
        if (session) {
            session.sessionData = sessionData;
            sessionStore.set(id, session);
        }
    });

    var accessToken = "";
    try {
        const result = await msal.msalCca.acquireTokenByClientCredential(msal.msalClientCredentialRequest);
        if (result) {
            accessToken = result.accessToken;
        }
    } catch {
        console.log("failed to get access token");
        res.status(401).json({
            'error': 'Could not acquire credentials to access your Azure Key Vault'
        });
        return;
    }
    issuanceConfig.callback.url = `https://${req.hostname}/api/issuer/issuance-request-callback`;
    issuanceConfig.callback.state = id;
    if (issuanceConfig.pin) {
        issuanceConfig.pin.value = generatePin(issuanceConfig.pin.length);
    }
    if (issuanceConfig.claims) {
        issuanceConfig.claims.given_name = "Megan";
        issuanceConfig.claims.family_name = "Bowen";
    }

    var client_api_request_endpoint = `${config.msIdentityHostName}verifiableCredentials/createIssuanceRequest`;

    var payload = JSON.stringify({
        "authority": issuanceConfig.authority,
        "includeQRCode": false,
        "registration": issuanceConfig.registration,
        "callback": {
            "url": `https://${req.hostname}/api/issuer/issuance-request-callback`,
            "state": id,
            "headers": {
                "api-key": apiKey
            }
        },
        "type": "VerifiedAffiliation",
        "manifest": issuanceConfig.manifest
    });
    const fetchOptions = {
        method: 'POST',
        body: payload,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length.toString(),
            'Authorization': `Bearer ${accessToken}`
        }
    };

    const response = await fetch(client_api_request_endpoint, fetchOptions);
    var resp = await response.json()
    if (issuanceConfig.pin) {
        resp.pin = issuanceConfig.pin.value;   // add pin code so browser can display it
    }
    if (response.status > 299) {
        res.status(400).json(resp.error);
    } else {
        res.status(200).json(resp);
    }
})

router.post('/issuance-request-callback', async (req, res) => {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        if (req.headers['api-key'] != apiKey) {
            res.status(401).json({
                'error': 'api-key wrong or missing'
            });
            return;
        }
        var issuanceResponse = JSON.parse(body.toString());
        var message = null;

        if (issuanceResponse.requestStatus == "request_retrieved") {
            message = "QR Code is scanned. Waiting for issuance to complete...";
            sessionStore.get(issuanceResponse.state, (error, session) => {
                var sessionData = {
                    "status": "request_retrieved",
                    "message": message
                };
                session.sessionData = sessionData;
                sessionStore.set(issuanceResponse.state, session, (error) => {
                    res.send();
                });
            })
        }

        if (issuanceResponse.requestStatus == "issuance_successful") {
            message = "Credential successfully issued";
            sessionStore.get(issuanceResponse.state, (error, session) => {
                var sessionData = {
                    "status": "issuance_successful",
                    "message": message
                };
                session.sessionData = sessionData;
                sessionStore.set(issuanceResponse.state, session, (error) => {
                    res.send();
                });
            })
        }

        if (issuanceResponse.requestStatus == "issuance_error") {
            sessionStore.get(issuanceResponse.state, (error, session) => {
                var sessionData = {
                    "status": "issuance_error",
                    "message": issuanceResponse.error.message,
                    "payload": issuanceResponse.error.code
                };
                session.sessionData = sessionData;
                sessionStore.set(issuanceResponse.state, session, (error) => {
                    res.send();
                });
            })
        }

        res.send()
    });
    res.send()
})

router.get('/issuance-response', async (req, res) => {
    var id = req.query.id;
    return res.status(200).json(req.session.sessionData);
})

module.exports = router

