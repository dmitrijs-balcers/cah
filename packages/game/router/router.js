const ROOM_ID = 'roomId_hard1';

FlowRouter.route('/game', {
    subscriptions: function () {
        this.register('players', Meteor.subscribe('players', ROOM_ID));
        this.register('selectedCards', Meteor.subscribe('selectedCards', ROOM_ID));
        this.register('currentBlackCards', Meteor.subscribe('currentBlackCards', ROOM_ID));
    },
    action: function(params) {
        BlazeLayout.render('layout', {main: 'game'});
    }
});