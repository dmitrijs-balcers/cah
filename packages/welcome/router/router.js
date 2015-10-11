FlowRouter.route('/', {
    subscriptions: function () {
        console.log('subscribe');
        this.register('winningCards', Meteor.subscribe('winningCards'));
    },
    action: function (params) {
        if (Meteor.isClient) {
            BlazeLayout.render('layout', {main: 'welcome'});
        }
    }
});