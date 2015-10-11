const ROOM_ID = 'roomId_hard1';

Players = new Mongo.Collection("players");
SelectedCards = new Mongo.Collection("selectedCards");
CurrentBlackCards = new Mongo.Collection("currentBlackCards");

FlowRouter.route('/game', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'game'});
    }
});

Template.game.onCreated(function () {

    var self = this;

    self.playerName = new ReactiveVar();

    Meteor.call('getRandomBlackCard', ROOM_ID, false, (e) => {

        if (e) {

            console.error(e);
            return;
        }

        Meteor.call('getName', (e, r) => {

            if (e) {
                console.error(e);
                return;
            }

            self.playerName.set(r);

            Meteor.call('initiatePlayer', ROOM_ID, self.playerName.get(), (e) => {

                if(e) {
                    alert(e);
                    return;
                }

                self.autorun(() => {
                    self.subscribe('players', ROOM_ID);
                    self.subscribe('selectedCards', ROOM_ID);
                    self.subscribe('currentBlackCards', ROOM_ID);
                });
            });

        });
    });
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

Template.game.events({

    'click .whiteCard' : function (e, t) {

        //TODO:change from innerHTML to something more sensible
        Meteor.call('playerSelectedCard', ROOM_ID, t.playerName.get(), e.target.innerHTML);
    },
    
    'click #exit' : function (e, t) {

        Meteor.call('exitGame', ROOM_ID, t.playerName.get());
    },

    'click #vote' : function (e, t) {

        Meteor.call('playerVotedForCard', ROOM_ID, t.playerName.get(), e.target.value);
    }
});
