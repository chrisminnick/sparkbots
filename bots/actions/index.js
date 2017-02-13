//todo: make it handle error cases better

const firstEntityValue = require('../utils/firstEntityValue.js');
const sessions = require('../utils/sessions.js');
const app = require('../witbot');
var http = require('http');

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
            const WEATHER_KEY = '16eba5a259d5a110';

            var options = {
                host: 'api.wunderground.com',
                path: '/api/'+WEATHER_KEY+'/geolookup/conditions/q/'+encodeURI(location)+'.json'

            };
            var callback = function(response){
                var str = '';
                response.on('data', function(chunk) {
                    str += chunk;
                });
                response.on('end', function() {
                    console.log(str);
                    str = JSON.parse(str);
                    context.forecast = str.current_observation.temp_f + " degrees and " + str.current_observation.weather + " in " + location;
                    /*spark.createMessage(message.roomId, "<@personEmail:" + trigger.data.personEmail + "> "+str.current_observation.temp_f+ " degrees (F). " + str.current_observation.weather, {"markdown": true}, function (err, message) {
                        if (err) {
                            console.log("WARNING: could not post message to room: " + command.message.roomId);
                            return;
                        }
                    });*/
                });
            };
            var request = http.get(options,callback).end();
            delete context.missingLocation;
        } else {
            context.missingLocation = true;
            delete context.forecast;
        }
        return context;
    }
};
module.exports = actions;