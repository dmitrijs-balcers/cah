var ROOM_ID = 'roomId_hard1';

Players = new Mongo.Collection("players");

FlowRouter.route('/game', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'game'});
    }
});

Template.game.onCreated(function () {

    var self = this,
        cardCount = 1,
        name;

    self.blackCard = new ReactiveVar();
    self.player = new ReactiveVar();
    self.maxWhiteCards = new ReactiveVar();
    self.maxWhiteCards = new ReactiveVar();

    Meteor.call('getRandomBlackCard', ROOM_ID, (e, r) => {

        if (e) {
            console.error(e);
        }

        cardCount = (r.match(/_/g)||[]).length || 1;
        self.maxWhiteCards.set(cardCount);
        self.blackCard.set(r);
    });

    Meteor.call('getName', (e, r) => {

        if (e) {
            console.error(e);
        }

        name = r;

        self.playerName.set(name);
    });

    Meteor.call('setMaxCardCount', ROOM_ID, cardCount);

    Meteor.call('initiatePlayer', ROOM_ID, name);

    self.player.set();
});

Template.game.onRendered(() => {

});

Template.game.events({

    'click .whiteCard' : function (event) {

    }
});

Template.game.helpers({

    blackCard: function () {
        return Template.instance().blackCard.get();
    },

    player: function () {
        return Players.findOne({name: Template.instance().playerName.get(), roomId: ROOM_ID});
    },

    blankify: function (text) {
        return text && text.replace(/_/g, '________');
    },

    playerName: function() {
        return Template.instance().playerName.get();
    }
});
