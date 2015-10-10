var cardsInRoom = {};

BlackCards = new Mongo.Collection("blackCards");

Meteor.methods({
    getRandomBlackCard : _getRandomBlackCard
});

function _getRandomBlackCard(roomId) {

    var card,
        randomId;


    console.log('packages/cards/cards.js', 'getting random black card for room', roomId);

    if(!cardsInRoom[roomId]) {

        console.log('getting black cards from database');

        try {
            cardsInRoom[roomId] = BlackCards.find({}).fetch();
        } catch (e) {

            console.error(e, 'error getting cards from database');
            return;
        }

        cardsInRoom[roomId] = _.pluck(cardsInRoom[roomId], 'text');
    }

    if(cardsInRoom[roomId].length <= 0) {

        console.error('No more cards for room:', roomId);
        throw new Meteor.Error('No more cards! :(');
    }

    console.log('getting one black card from stack', cardsInRoom[roomId].length);

    randomId = _.random(0, cardsInRoom[roomId].length - 1);

    card = cardsInRoom[roomId][randomId];

    console.log('got black random card', card);

    cardsInRoom[roomId] = _.without(cardsInRoom[roomId], card);

    console.log('removed the card from room stack');

    return card;
}
