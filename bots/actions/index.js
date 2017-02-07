const firstEntityValue = require('../utils/firstEntityValue.js');
const sessions = require('../utils/sessions.js');
const app = require('../witbot');

const actions = {
    send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        console.log('sending...', JSON.stringify(response));
        const recipientId = sessions[sessionId].sparkid;
        console.log('to roomId: ', app.room.id);
        console.log('for sessionId ', sessionId);
        console.log('session info: ', sessions[sessionId]);
        console.log('for recipientId ', recipientId);
        if (recipientId) {
        console.log(text);
        app.spark.createMessage(app.room.id, "" + text + "", {"markdown": true}, function (err, message) {
            if (err) {
                console.log("WARNING: could not post message to room: " + room.id);
                return;
            }
        });
        }
    },
    getForecast({context, entities}) {

        var location = firstEntityValue(entities, 'location');
        if (location) {
            context.forecast = 'sunny in ' + location; // we should call a weather API here
            delete context.missingLocation;
        } else {
            context.missingLocation = true;
            delete context.forecast;
        }
        return context;
    }
};
module.exports = actions;