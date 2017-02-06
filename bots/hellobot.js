var SparkBot = require("node-sparkbot");
var SparkAPIWrapper = require("node-sparkclient");


if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node helloworld.js");
    process.exit(1);
}

const bot = new SparkBot();
const spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);
var myId;

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
        myId = me.id;
    }
});

// Agrees with everything
bot.onMessage(function(trigger, message) {
    if(trigger.data.personId != myId) {
        console.log("new message from: " + trigger.data.personEmail + ", text: " + message.text);

        spark.createMessage(message.roomId, "<@personEmail:" + trigger.data.personEmail + "> I agree.", {"markdown": true}, function (err, message) {
            if (err) {
                console.log("WARNING: could not post message to room: " + command.message.roomId);
                return;
            }
        });
    }
});