var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    // appId: process.env.MICROSOFT_APP_ID,
    // appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to the cleaner bot");
        builder.Prompts.choice(session, "How many rooms do you need cleaning?", 
            "1|2|3|4|5|5+", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        // session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.dialogData.numberOfRooms = results.response;
        builder.Prompts.choice(session, "What type of house do you have?", 
            "Detached|Semi|Terraced|Apartment", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        session.dialogData.houseType = results.response;
        builder.Prompts.choice(session, "Do you have any pets?", 
            "Yes|No", { listStyle: builder.ListStyle.button });
    },
    function(session, results) {
        session.dialogData.pets = results.response;
        builder.Prompts.choice(session, "Do you have any children?",
            "Yes|No", { listStyle: builder.ListStyle.button });
    },
    function(session, results) {
        session.dialogData.children = results.response;
        session.send(`Reservation confirmed. Reservation details: 
            <br/>Number of rooms: ${session.dialogData.numberOfRooms.entity} 
            <br/>House Type: ${session.dialogData.houseType.entity} 
            <br/>Pets: ${session.dialogData.pets.entity} 
            <br/>Children: ${session.dialogData.children.entity}`);
        builder.Prompts.confirm(session, "Are these details correct?");
    },
    function (session, results) {
        session.dialogData.confirmed = results.response;

        // Process request and display reservation details
        session.send("Confirmed: " + session.dialogData.confirmed);
        session.endDialog();
    }
]);