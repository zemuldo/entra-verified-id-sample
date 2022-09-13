const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var uuid = require('uuid');
var express = require('express');
const sessionStore = require('../config/session');
const { msalCca, msalClientCredentialRequest } = require('../config/msal');
const config = require('../config/vc');

const router = express()

var requestConfigFile = process.argv.slice(2)[2];
if (!requestConfigFile) {
    requestConfigFile = process.env.PRESENTATIONFILE || '../config/presentation_request_config.json';
}
var presentationConfig = require(requestConfigFile);
presentationConfig.registration.clientName = "LinkedIn";
presentationConfig.authority = config["VerifierAuthority"]
presentationConfig.requestedCredentials[0].acceptedIssuers[0] = config["IssuerAuthority"]
var apiKey = uuid.v4();
if (presentationConfig.callback.headers) {
    presentationConfig.callback.headers['api-key'] = apiKey;
}

router.get('/presentation-request', async (req, res) => {
    var id = req.session.id;
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
        const result = await msalCca.acquireTokenByClientCredential(msalClientCredentialRequest);
        if (result) {
            accessToken = result.accessToken;
        }
    } catch {
        res.status(401).json({
            'error': 'Could not acquire credentials to access your Azure Key Vault'
        });
        return;
    }
    presentationConfig.callback.url = `https://${req.hostname}/api/verifier/presentation-request-callback`;
    presentationConfig.callback.state = id;

    var client_api_request_endpoint = `${config.msIdentityHostName}verifiableCredentials/createPresentationRequest`;
    var payload = JSON.stringify(presentationConfig);
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
          
    resp.id = id;                            
    res.status(200).json(resp);
})

router.post('/presentation-request-callback', async (req, res) => {
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
        var presentationResponse = JSON.parse(body.toString());
           
        if (presentationResponse.requestStatus == "request_retrieved") {
            sessionStore.get(presentationResponse.state, (error, session) => {
                var cacheData = {
                    "status": presentationResponse.requestStatus,
                    "message": "QR Code is scanned. Waiting for validation..."
                };
                session.sessionData = cacheData;
                sessionStore.set(presentationResponse.state, session, (error) => {
                    res.send();
                });
            })
        }
        if (presentationResponse.requestStatus == "presentation_verified") {
            sessionStore.get(presentationResponse.state, (error, session) => {
                var cacheData = {
                    "status": presentationResponse.requestStatus,
                    "message": "Presentation received",
                    "payload": presentationResponse.verifiedCredentialsData,
                    "subject": presentationResponse.subject,
                    "firstName": presentationResponse.verifiedCredentialsData[0].claims.firstName,
                    "lastName": presentationResponse.verifiedCredentialsData[0].claims.lastName,
                    "presentationResponse": presentationResponse
                };
                session.sessionData = cacheData;
                sessionStore.set(presentationResponse.state, session, (error) => {
                    res.send();
                });
            })
        }
    });
    res.send()
})

router.get('/presentation-response', async (req, res) => {
    var id = req.query.id;
    sessionStore.get(id, (error, session) => {
        if (session && session.sessionData) {
            console.log(`status: ${session.sessionData.status}, message: ${session.sessionData.message}`);
            if (session.sessionData.status == "presentation_verified") {
                delete session.sessionData.presentationResponse; // browser don't need this
            }
            res.status(200).json(session.sessionData);
        }
    })
})

module.exports = router;