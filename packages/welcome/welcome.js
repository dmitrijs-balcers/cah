FlowRouter.route('/', {
    action: function (params) {
        BlazeLayout.render('layout', {main: 'welcome'});
    }
});

Template.welcome.onCreated(function () {

    this.subscribe('winningCards');
    this.winningCard = new ReactiveVar();

    var self = this;

    updateWinningCard(self.winningCard);

    Meteor.setInterval(function () {
        updateWinningCard(self.winningCard);
    }, 10000);

});

function updateWinningCard(winningCard) {
    var total = WinningCards.find().count();
    winningCard.set(WinningCards.findOne({}, {skip: _.random(0, total - 1)}));
    console.log(winningCard.get());
}

Template.welcome.helpers({
    winningCard: function () {
        return Template.instance().winningCard.get();
    },

    blackCard: function () {

        console.log('blackCard');

        var self = this;

        if (self.blackCard.search("_") === -1) {
            return self.blackCard + `${redify(self.whiteCards[0])}`;
        }

        _.each(self.whiteCards, function (whiteCard) {
            self.blackCard = self.blackCard.replace('_', `${redify(whiteCard)}`);
        });

        return self.blackCard;
    }
});

function redify(text) {
    return `<span style='color: red; font-size: 1.3em;'>${text}</span>`;
}