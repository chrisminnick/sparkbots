# Hellobot Instructions
1. cd sparkbot-labs
2. npm init
3. answer the questions
4. npm install --save node-sparkbot node-sparkclient
5. create a new file named hellobot.js
6. Bring in the libraries
    ```javascript
    var SparkBot = require("node-sparkbot");
    var SparkAPIWrapper = require("node-sparkclient");
    ```
7. Check for the required ENV variables
    ```
    if (!process.env.SPARK_TOKEN) {
         console.log("Could not start as this bot requires a Cisco Spark API access token.");
         console.log("Please add env variable SPARK_TOKEN on the command line");
         console.log("Example: ");
         console.log("> SPARK_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node hellobot.js");
         process.exit(1);
     }
     ```
8. Set up required objects and variables
    ```
     const bot = new SparkBot();
     const spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);
     var myId;
     ```
9. Find out who your bot is
    ```
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
    ```
10. Make your bot listen for messages and say "I agree." when one 
  one comes in from any other user.
    ```javascript
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
    ```
11. Save and return to the command line.
12. Run the bot by entering the following (replacing the XXXes after SPARK_TOKEN with your bot's token.
    ```
    SPARK_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node hellobot.js
    ```