Meteor.publish('winningCards', () => {
    return WinningCards.find();
});