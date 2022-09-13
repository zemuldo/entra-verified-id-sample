const session = require('express-session')

const sessionStore = new session.MemoryStore();

module.exports = sessionStore