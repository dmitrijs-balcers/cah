FlowRouter.route('/', {
    action: function (params) {
        BlazeLayout.render('layout', {main: 'welcome'});
    }
});

Template.welcome.onCreated(function () {

    // this <= Template.instance()

    this.winningCard = {
        player: 'Suzan',
        whiteCards: ['blahA', 'blahB'],
        blackCard: 'a: _, b: _',
        votes: 10
    };
});

Template.welcome.helpers({
    winningCard: function () {
        return Template.instance().winningCard;
    },

    blackCard: function () {
        var winningCard = Template.instance().winningCard;

        if (winningCard.blackCard.search("_") === -1) {
            return winningCard.blackCard + `${redify(winningCard.whiteCards[0])}`;
        }

        _.each(winningCard.whiteCards, function (whiteCard) {
            winningCard.blackCard = winningCard.blackCard.replace('_', `${redify(whiteCard)}`);
        });

        return winningCard.blackCard;
    }
});

function redify(text) {
    return `<span style='color: red; font-size: 1.3em;'>${text}</span>`;
}