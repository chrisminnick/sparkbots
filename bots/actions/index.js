const send = (request, response) => {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        console.log('sending...', JSON.stringify(response));
        const recipientId = sessions[sessionId].sparkid;

        //if (recipientId) {
        console.log(text);
        spark.createMessage(roomid, "" + text + "", {"markdown": true}, function (err, message) {
            if (err) {
                console.log("WARNING: could not post message to room: " + roomId);
                return;
            }
        });
        //}
    };

const getForecast = ({context, entities}) => {
        var location = firstEntityValue(entities, 'location');
        if (location) {
            context.forecast = 'sunny in ' + location; // we should call a weather API here
            delete context.missingLocation;
        } else {
            context.missingLocation = true;
            delete context.forecast;
        }
        return context;
};

module.exports = actions;