FlowRouter.route('/', {
    action: function (params) {
        BlazeLayout.render('layout', {main: 'welcome'});
    }
});

Template.welcome.onCreated(function () {

    this.subscribe('winningCards');
});

Template.welcome.helpers({
    winningCard: function () {

        var total = WinningCards.find().count();

        return WinningCards.findOne({}, {skip: _.random(0, total - 1)});
    },

    blackCard: function () {

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