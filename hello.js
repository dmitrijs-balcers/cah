WhiteCards = new Mongo.Collection("whiteCards");
BlackCards = new Mongo.Collection("blackCards");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({

    whiteCard: function () {
        //TODO: find 10 cards that are not in other players hands and not yet played
        return WhiteCards.find({}, {limit:10});
    },
    blackCard: function() {
        //TODO: chose random black card that has not been played in game
        var card = BlackCards.findOne({_id:'vE9N4SmPDig3bsptF'});
        card.text = card.text.replace('_', '_______');
        return card;
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
