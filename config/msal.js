const fs = require("fs");
const msal = require('@azure/msal-node');
const config = require('./vc')

var msalConfig = {
  auth: {
    clientId: config.azClientId,
    authority: `https://login.microsoftonline.com/${config.azTenantId}`,
    clientSecret: config.azClientSecret,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};

const msalCca = new msal.ConfidentialClientApplication(msalConfig);
const msalClientCredentialRequest = {
  scopes: ["3db474b9-6a0c-4840-96ac-1fceb342124f/.default"],
  skipCache: false,
};

module.exports = { msalCca, msalClientCredentialRequest };