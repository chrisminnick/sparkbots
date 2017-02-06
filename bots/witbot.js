// sparkwit-bot
// created by Chris Minnick

// a Cisco Spark bot that integrates with wit.ai to understand natural language
// messages in Spark conversations

// To run with sample wit account and spark bot :
// SPARK_TOKEN=ZTgzM2IyYTktNDAzOS00NzgzLTk1M2YtOWI5MThhZWIzMTk0ZDcxOWZmODEtM2I4 WIT_TOKEN=ZEX5YTS4WODTRAPXTB5P72GQSTFVKGTQ DEBUG=sparkbot* node witbot.js

const SparkBot = require("node-sparkbot");
const SparkAPIWrapper = require("node-sparkclient");
const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const firstEntityValue = require('./utils/firstEntityValue.js');
const findOrCreateSession = require('./utils/findOrCreateSession.js');
const actions = require('./actions/index.js');


if ((!process.env.SPARK_TOKEN)||(!process.env.SPARK_TOKEN)){
    console.log("Could not start as this bot requires a Cisco Spark API access token ");
    console.log("and a wit API access token ");
    console.log("Please add env variables SPARK_TOKEN and WIT_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX WIT_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node witbot.js");
    process.exit(1);
}

const WIT_TOKEN = process.env.WIT_TOKEN;
const SPARK_TOKEN = process.env.SPARK_TOKEN;


const brain = new Wit({
    accessToken: WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

const bot = new SparkBot();
const spark = new SparkAPIWrapper(SPARK_TOKEN);
var sparkid;
var roomId;

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

const sessions = {};
const sessionId = findOrCreateSession(sparkid);

bot.onMessage(function(trigger, message) {
    roomId = message.roomId;
    if (trigger.data.personId != sparkid) {
        console.log("new message from: " + trigger.data.personEmail + ", text: " + message.text);
        console.log("roomId: " + roomId);

// Let's forward the message to the Wit.ai Bot Engine
// This will run all actions until our bot has nothing left to do
        brain.runActions(
            sessionId, // the user's current session
            message.text, // the user's message
            sessions[sessionId].context // the user's current session state
        ).then((context) => {
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
