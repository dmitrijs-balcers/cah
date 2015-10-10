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

        _.each(winningCard.whiteCards, function (whiteCard) {
            winningCard.blackCard = winningCard.blackCard.replace('_', whiteCard);
        });

        return winningCard.blackCard;
    }
});