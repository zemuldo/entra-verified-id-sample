var configFile = process.argv.slice(2)[0];
if (!configFile) {
    configFile = process.env.CONFIGFILE || '../config.json';
}
const config = require(configFile)
if (!config.azTenantId) {
    throw new Error('The config.json file is missing.')
}

config.msIdentityHostName = "https://verifiedid.did.msidentity.com/v1.0/";

module.exports = config;
