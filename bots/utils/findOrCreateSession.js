const sessions = require('../utils/sessions.js');
const app = require('../witbot');

module.exports = (sparkid) => {
    let sessionId;
    // Let's see if we already have a session for the user
    Object.keys(sessions).forEach(k => {
        if (sessions[k].sparkid === sparkid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {sparkid: sparkid, context: {}};
    }

    return sessionId;
};