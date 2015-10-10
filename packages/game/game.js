FlowRouter.route('/game', {
    action: function(params) {
        BlazeLayout.render('layout', {main: 'game'});
    }
});

Template.game.onCreated(function () {

    var self = this;

    self.blackCard = new ReactiveVar();
    self.whiteCards = new ReactiveVar();

    Meteor.call('getRandomBlackCard', 'roomId_hard1', (e, r) => {
        if (e) {
            console.error(e);
        }

        self.blackCard.set(r);
    });

    Meteor.call('getRandomWhiteCards', 'roomId_hard1', 10, (e, r) => {
        if (e) {
            console.error(e);
        }

        self.whiteCards.set(r);
    });
});

Template.game.onRendered(() => {

});

Template.game.helpers({

    blackCard: function () {
        return Template.instance().blackCard.get();
    },

    whiteCards: function () {
        return Template.instance().whiteCards.get();
    },

    blankify: function (text) {
        return text && text.replace(/_/g, '________')
    }
});