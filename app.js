var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.get(/\/?.*\//, restify.plugins.serveStatic({
    directory: './icons'
}));
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

var bot = new builder.UniversalBot(connector, []);


// welcome dialog - shows the main menu
bot.dialog('welcome', [
    function (session, args, next) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel);
        msg.attachments([
            new builder.HeroCard(session)
                .title("Welcome To Housewrk")
                .subtitle("Hi there! 😄")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/Housewrk_fb_profile.png')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "news", "📢 Housewrk News"),
                    builder.CardAction.imBack(session, "invite", "👏 Invite")
                ]),
            new builder.HeroCard(session)
                .title("Book a Cleaner")
                .subtitle("Book a cleaner in less than 3 minutes 😎")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/Housewrk_fb_profile.png')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "booking", "🎉 Book a Cleaner"),
                    builder.CardAction.imBack(session, "appointments", "📅 My Appointments")
                ]),
            new builder.HeroCard(session)
                .title("Help")
                .subtitle("Ask me anything, I'm here to help 😃")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/Housewrk_fb_profile.png')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "feedback", "✍️ Leave Feedback"),
                    builder.CardAction.imBack(session, "human", "🙂 Talk to a Human")
                ])
        ]);
        session.send(msg);
    }
]).triggerAction({ matches: /Home/ });


// cancel dialog
bot.dialog('cancel', function(session, args, next) {
    session.endDialog("Booking cancelled");
}).triggerAction({
    matches: /^cancel$/i
});


// booking dialog
bot.dialog('booking', [
    function (session) {
        session.send("Right, let's do this.");
        session.beginDialog('askForHouseType');
    },
    function (session, results) {
        session.dialogData.houseType = results.response;
        session.beginDialog('askForNumberOfRooms');
    },
    function (session, results) {
        session.dialogData.numberOfRooms = results.response;
        session.beginDialog('askForPets');
    },
    function(session, results) {
        session.dialogData.pets = results.response;
        session.beginDialog('askForChildren');
    },
    function(session, results) {
        session.dialogData.children = results.response;
        session.send(`Reservation confirmed. Reservation details: 
            <br/>Number of rooms: ${session.dialogData.numberOfRooms.entity} 
            <br/>House Type: ${session.dialogData.houseType} 
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
])
.triggerAction({ matches: /booking/ });


// dialog that asks for the house type
bot.dialog('askForHouseType', [
    function(session) {
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel);
        msg.attachments([
            new builder.HeroCard(session)
                .title("Choose your house type")
                .subtitle("🏠 Detached House")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/detached.jpg')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "Detached", "Select")
                ]),
            new builder.HeroCard(session)
                .title("Choose your house type")
                .subtitle("🏤 Semi-Detached House")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/semi-detached.jpg')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "Semi", "Select")
                ]),
            new builder.HeroCard(session)
                .title("Choose your house type")
                .subtitle("🌇 Terraced House")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/terrace.jpg')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "Terrace", "Select")
                ]),
            new builder.HeroCard(session)
                .title("Choose your house type")
                .subtitle("🏢 Apartment/Flat")
                .images([
                    builder.CardImage.create(session, 'http://localhost:3978/apartment.png')
                ])
                .buttons([
                    builder.CardAction.imBack(session, "Apartment", "Select")
                ])
        ]);
        
        builder.Prompts.text(session, msg);
    },
    function(session, results) {
        session.endDialogWithResult(results);
    }
]).beginDialogAction('askForHouseTypeHelpAction', 'askForHouseTypeHelp', { matches: /^help$/i });

// ask for house type help dialog
bot.dialog('askForHouseTypeHelp', function(session, args, next) {
    var msg = "This is your house type. It's usually either detached, semi-detached, terraced, or an apartment/flat, but if not feel free to type anything here.";
    session.endDialog(msg);
});


// number of rooms dialog
bot.dialog('askForNumberOfRooms', [
    function(session) {
        builder.Prompts.choice(session, "❓ How many rooms do you need cleaning?", 
            "1|2|3|4|5|More", { listStyle: builder.ListStyle.button });
    },
    function(session, results) {
        session.endDialogWithResult(results);
    }
]).beginDialogAction('askForNumberOfRoomsHelpAction', 'askForNumberOfRoomsHelp', { matches: /^help$/i });

// ask for number of rooms help dialog
bot.dialog('askForNumberOfRoomsHelp', function(session, args, next) {
    var msg = "We ask this to help us determine the best price for you and to schedule an appointment that is long enough to get the job done to your satisfaction.";
    session.endDialog(msg);
});


// pets dialog
bot.dialog('askForPets', [
    function(session) {
        builder.Prompts.choice(session, "🐶 Do you have any pets?", 
            "Yes|No", { listStyle: builder.ListStyle.button });
    },
    function(session, results) {
        session.endDialogWithResult(results);
    }
]).beginDialogAction('askForPetsHelpAction', 'askForPetsHelp', { matches: /^help$/i });

// pets help dialog
bot.dialog('askForPetsHelp', function(session, args, next) {
    var msg = "We ask this to help us bring the correct equipment with us to give your house a proper clean!";
    session.endDialog(msg);
});


// children dialog
bot.dialog('askForChildren', [
    function(session) {
        builder.Prompts.choice(session, "👶 Do you have any children?",
            "Yes|No", { listStyle: builder.ListStyle.button });
    },
    function(session, results) {
        session.endDialogWithResult(results);
    }
]).beginDialogAction('askForChildrenHelpAction', 'askForChildrenHelp', { matches: /^help$/i });

// children help dialog
bot.dialog('askForChildrenHelp', function(session, args, next) {
    var msg = "We know what kids are like! This will help us prepare for a thorough clean for you.";
    session.endDialog(msg);
});


// show welcome dialog when a user connects to a conversation
bot.on('conversationUpdate', function(message) {
    if(message.membersAdded) {
        message.membersAdded.forEach(function(identity) {
            if(identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, 'welcome');
            }
        });
    }
});