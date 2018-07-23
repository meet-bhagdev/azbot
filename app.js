/*-----------------------------------------------------------------------------
This template demonstrates how to use dialogs with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = '0ef85d2b-8bda-42d6-89a3-5f92a3a18d2a';
var luisAPIKey = '1aefa02bef834c3a9701cfa8b4f76cc9';
var luisAPIHostName = 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('TurnOnDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn on a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning on the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns on a device
        } else {
            // Assuming turning on lights is the default
            session.send('Ok, turning on the lights');
            // Put your code here for calling the IoT web service that turns on a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOn'
})



bot.dialog('Create Database', session => {
    session.endDialog(`Hi Meet! You asked me to create a database, I am on it!`);
}).triggerAction({
    matches: 'Create Database'
});

bot.dialog('Help', session => {
    session.endDialog(`Hi Meet!!! Try asking me things like 'search hotels in Seattle', 'search hotels near LAX airport' or 'show me the reviews of The Bot Resort'`);
}).triggerAction({
    matches: 'Help'
});

bot.dialog('Scale Database', session => {
    session.endDialog(`Hi Meet! You asked me to scale a database, I am on it!`);
}).triggerAction({
    matches: 'Scale Database'
});

bot.dialog('Delete Database', session => {
    session.endDialog(`Hi Meet! You asked me to delete a database, I am on it!`);
}).triggerAction({
    matches: 'Delete Database'
});

bot.dialog('ShowHotelsReviews', (session, args) => {
    // retrieve hotel name from matched entities
    const hotelEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Hotel');
    if (hotelEntity) {
        session.send(`Looking for reviews of '${hotelEntity.entity}'...`);
        Store
            .searchHotelReviews(hotelEntity.entity)
            .then(reviews => {
                let message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(reviews.map(reviewAsAttachment));
                session.endDialog(message);
            });
    }
}).triggerAction({
    matches: 'ShowHotelsReviews'
});

bot.dialog('TurnOffDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn off a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning off the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns off a device
        } else {
            // Assuming turning off lights is the default
            session.send('Ok, turning off the lights.');
            // Put your code here for calling the IoT web service that turns off a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOff'
})