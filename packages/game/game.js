var ROOM_ID = 'roomId_hard1';

Players = new Mongo.Collection("players");
SelectedCards = new Mongo.Collection("selectedCards");
CurrentBlackCards = new Mongo.Collection("currentBlackCards");

FlowRouter.route('/game', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'game'});
    }
});

Template.game.onCreated(function () {

    var self = this,
        cardCount = 1;

    self.playerName = new ReactiveVar();
    self.blackCard = new ReactiveVar();

    Meteor.call('getRandomBlackCard', ROOM_ID, false, (e, r) => {

        if (e) {
            console.error(e);
        }

        self.blackCard.set(r);
    });

    Meteor.call('getName', (e, r) => {

        if (e) {
            console.error(e);
        }

        self.playerName.set(r);

        Meteor.call('initiatePlayer', ROOM_ID, self.playerName.get(), (e, r) => {

            if(e) {
                alert(e);
                return;
            }
            
            self.autorun(function () {
                self.subscribe('players', ROOM_ID);
                self.subscribe('selectedCards', ROOM_ID);
                self.subscribe('currentBlackCards', ROOM_ID);
            });
        });

    });
});

Template.game.onRendered(() => {

});

Template.game.events({

    'click .whiteCard' : function (event) {
        //TODO:change from innerHTML to something more sensible
        Meteor.call('playerSelectedCard', ROOM_ID, Template.instance().playerName.get(), event.target.innerHTML);
    },

    'click #end' : function () {

        Meteor.call('endRound', ROOM_ID);
    },

    'click #exit' : function () {

        Meteor.call('exitGame', ROOM_ID, Template.instance().playerName.get());
    }
});

Template.game.helpers({

    blackCard: function () {
        return CurrentBlackCards.findOne({roomId: ROOM_ID});
    },

    player: function () {
        return Players.findOne({name: Template.instance().playerName.get(), roomId: ROOM_ID});
    },
    players: function () {
        return Players.find({roomId: ROOM_ID}).fetch();
    },
    blankify: function (text) {
        return text && text.replace(/_/g, '________');
    },

    selectedCards: function() {
        return SelectedCards.find({roomId: ROOM_ID}).fetch();
    }
});
