'use strict';

var SparkBot = require("node-sparkbot");
var SparkAPIWrapper = require("node-sparkclient");
let Wit = null;
let log = null;
try {
    // if running from repo
    Wit = require('../').Wit;
    log = require('../').log;
} catch (e) {
    Wit = require('node-wit').Wit;
    log = require('node-wit').log;
}

const WIT_TOKEN = process.env.WIT_TOKEN;

const actions = {
    send(request, response) {
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

const brain = new Wit({
    accessToken: WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});


if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node helloworld.js");
    process.exit(1);
}

const bot = new SparkBot();
const spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);
var sparkid;
var roomid;

//
// WHO AM I?
//
spark.getMe(function(err, me) {
    if (!err) {
        console.log(me.id);
        console.log(me.emails);
        console.log(me.displayName);
        console.log(me.avatar);
        console.log(me.created);
        sparkid = me.id;
    }
});


const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

const sessions = {};

const findOrCreateSession = (sparkid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
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




const sessionId = findOrCreateSession(sparkid);

bot.onMessage(function(trigger, message) {
    roomid = message.roomId;
    if (trigger.data.personId != sparkid) {
        console.log("new message from: " + trigger.data.personEmail + ", text: " + message.text);

// Let's forward the message to the Wit.ai Bot Engine
// This will run all actions until our bot has nothing left to do
        brain.runActions(
            sessionId, // the user's current session
            message.text, // the user's message
            sessions[sessionId].context // the user's current session state
        ).then((context) => {
            console.log(context);
            // Our bot did everything it has to do.
            // Now it's waiting for further messages to proceed.
            console.log('Waiting for next user messages');

            // Based on the session state, you might want to reset the session.
            // This depends heavily on the business logic of your bot.
            // Example:
            // if (context['done']) {
            //   delete sessions[sessionId];
            // }

            // Updating the user's current session state
            sessions[sessionId].context = context;
        })
            .catch((err) => {
                console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
    }
});
