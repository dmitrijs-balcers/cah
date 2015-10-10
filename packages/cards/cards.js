var blackCardsInRoom = {},
    whiteCardsInRoom = {};

BlackCards = new Mongo.Collection("blackCards");
WhiteCards = new Mongo.Collection("whiteCards");

Meteor.methods({
    getRandomBlackCard : _getRandomBlackCard,
    getRandomWhiteCards : _getRandomWhiteCards
});

function _getRandomBlackCard(roomId) {

    var card,
        randomId;

    console.log('packages/cards/cards.js', 'getting random black card for room', roomId);

    if(!blackCardsInRoom[roomId]) {

        console.log('getting black cards from database');

        try {
            blackCardsInRoom[roomId] = BlackCards.find({}).fetch();
        } catch (e) {

            console.error(e, 'error getting black cards from database');
            return;
        }

        blackCardsInRoom[roomId] = _.pluck(blackCardsInRoom[roomId], 'text');
    }

    if(blackCardsInRoom[roomId].length <= 0) {

        console.error('No more black cards for room:', roomId);
        throw new Meteor.Error('No black more cards! :(');
    }


    randomId = _.random(0, blackCardsInRoom[roomId].length - 1);

    card = blackCardsInRoom[roomId][randomId];

    console.log('got black random card', card);

    blackCardsInRoom[roomId] = _.without(blackCardsInRoom[roomId], card);

    console.log('removed the black card from room stack');
    console.log('black cards remaining', blackCardsInRoom[roomId].length);

    return card;
}

function _getRandomWhiteCards(roomId, count) {

    var card,
        cards,
        randomId;

    console.log('packages/cards/cards.js', 'getting random ', count,' white cards for room', roomId);

    if(!whiteCardsInRoom[roomId]) {

        console.log('getting white cards from database');

        try {
            whiteCardsInRoom[roomId] = WhiteCards.find({}).fetch();
        } catch (e) {

            console.error(e, 'error getting white cards from database');
            return;
        }

        whiteCardsInRoom[roomId] = _.pluck(whiteCardsInRoom[roomId], 'text');
    }

    if(whiteCardsInRoom[roomId].length <= 0) {

        console.error('No more white cards for room:', roomId);
        throw new Meteor.Error('No white more cards! :(');
    }

    cards = [];

    _.times(count, function(){

        console.log('getting one white card from stack', whiteCardsInRoom[roomId].length);

        randomId = _.random(0, whiteCardsInRoom[roomId].length - 1);

        card = whiteCardsInRoom[roomId][randomId];

        console.log('got white random card', card);

        cards.push(card);

        whiteCardsInRoom[roomId] = _.without(whiteCardsInRoom[roomId], card);

        console.log('removed the white card from room stack');
        console.log('white cards remaining', whiteCardsInRoom[roomId].length);
    });

    return cards;
}
