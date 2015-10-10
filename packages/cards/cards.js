var blackCardsInRoom = {},
    whiteCardsInRoom = {},
    maxCardCount = {};

BlackCards = new Mongo.Collection("blackCards");
CurrentBlackCards = new Mongo.Collection("currentBlackCards");
WhiteCards = new Mongo.Collection("whiteCards");
WinningCards = new Mongo.Collection("winningCards");
SelectedCards = new Mongo.Collection("selectedCards");
Players = new Mongo.Collection("players");

Meteor.publish('players', function (roomId) {
    return Players.find({roomId: roomId});
});
Meteor.publish('selectedCards', function (roomId) {
    return SelectedCards.find({roomId: roomId});
});
Meteor.publish('currentBlackCards', function (roomId) {
    return CurrentBlackCards.find({roomId: roomId});
});

Meteor.setInterval(function () {

    Players.remove({lastActivity: {$lte: new Date(new Date() - 5 * 60 * 1000)}});
}, 10 * 1000);

Meteor.methods({

    getRandomBlackCard: _getRandomBlackCard,
    initiatePlayer: _initiatePlayer,
    playerSelectedCard: _playerSelectedCard,
    playerVotedForCard: _playerVotedForCard,
    endRound: _endRound
});

function _getRandomBlackCard(roomId, regenerate) {

    let card, randomId;

    console.log('packages/cards/cards.js', 'getting random black card for room', roomId);

    card = CurrentBlackCards.findOne({roomId: roomId});

    card = card && card.card;

    // If there is a card assigned to this room, then use that card.
    // If there isn't any card assigned to this room, then generate new card.
    if (!blackCardsInRoom[roomId]) {

        console.log('no black cards in the room');

        var blackCards = BlackCards.find({}).fetch();
        blackCardsInRoom[roomId] = _.pluck(blackCards, 'text');

        regenerate = true;
    }

    if (regenerate) {

        if (blackCardsInRoom[roomId].length <= 0) {

            console.error('No more black cards for room:', roomId);
            throw new Meteor.Error('No black more cards! :(');
        }

        randomId = _.random(0, blackCardsInRoom[roomId].length - 1);

        if (card) {

            card = blackCardsInRoom[roomId][randomId];
            CurrentBlackCards.update({roomId: roomId}, {$set: {card: card}});
        } else {

            card = blackCardsInRoom[roomId][randomId];
            CurrentBlackCards.insert({roomId: roomId, card: card});
        }

        blackCardsInRoom[roomId] = _.without(blackCardsInRoom[roomId], card);
    }

    _setMaxCardCount(roomId, (card.match(/_/g) || []).length || 1);

}

function _getRandomWhiteCards(roomId, count) {

    var card,
        cards,
        randomId;

    console.log('packages/cards/cards.js', 'getting random ', count, ' white cards for room', roomId);

    if (!whiteCardsInRoom[roomId]) {

        var whiteCards = WhiteCards.find({}).fetch();

        whiteCardsInRoom[roomId] = _.pluck(whiteCards, 'text');
    }

    if (whiteCardsInRoom[roomId].length <= 0) {

        console.error('No more white cards for room:', roomId);
        throw new Meteor.Error('No white more cards! :(');
    }

    cards = [];

    _.times(count, function () {

        randomId = _.random(0, whiteCardsInRoom[roomId].length - 1);

        card = whiteCardsInRoom[roomId][randomId];

        cards.push(card);

        whiteCardsInRoom[roomId] = _.without(whiteCardsInRoom[roomId], card);

    });

    return cards;
}

function _setMaxCardCount(roomId, count) {

    maxCardCount[roomId] = count;
}

function _initiatePlayer(roomId, name) {

    var count = Players.find({roomId: roomId}).count();

    if (count >= 10) {
        throw new Meteor.Error('Room is full');
    }

    var player = {
        name: name,
        roomId: roomId,
        score: 0,
        cards: _getRandomWhiteCards(roomId, 10),
        lastActivity: new Date()
    };

    Players.insert(player);
}

function _playerSelectedCard(roomId, playerName, card) {

    var cards;

    cards = SelectedCards.findOne({player: playerName, roomId: roomId}) || {};

    if (!cards.whiteCards || cards.whiteCards.length < maxCardCount[roomId]) {

        console.log(playerName, 'selected white card', card);

        Players.update(
            {
                name: playerName,
                roomId: roomId,
            },
            {
                $set: {lastActivity: new Date()},
                $pull: {cards: card}
            }
        );

        if (cards.whiteCards) {

            SelectedCards.update(
                {
                    player: playerName,
                    roomId: roomId
                },
                {
                    $push: {whiteCards: card}
                });
            return;
        }

        SelectedCards.insert({

            player: playerName,
            whiteCards: [card],
            roomId: roomId,
            votes: 0
        });

        return;
    }

    console.error('player has selected max cards');
    throw new Meteor.Error('player has selected max cards');
}

function _playerVotedForCard(roomId, playerName, selectedCardsId) {

    var playerCard;

    Players.update(
        {
            name: playerName,
            roomId: roomId
        },
        {
            $set: {lastActivity: new Date()}
        }
    );

    playerCard = SelectedCards.findOne({_id: selectedCardsId});

    if (playerCard) {
        console.error('player cannot vote for own card');
        throw new Meteor.error('player cannot vote for his own card');
    }

    SelectedCards.update({_id: selectedCardsId}, {$inc: {votes: 1}});
}

function _endRound(roomId) {

    var winningCards;

    winningCards = SelectedCards.findOne({}, {sort: {votes: 1}, fields: {_id: 0}});
    winningCards.blackCard = CurrentBlackCards.findOne({roomId: roomId}).card;

    WinningCards.insert(winningCards);

    Players.update(
        {
            name: winningCards.player,
            roomId: roomId
        },
        {
            $inc: {score: 1}
        });

    Players.update(
        {roomId: roomId},
        {
            $push: {
                cards: {
                    $each: _getRandomWhiteCards(roomId, winningCards.whiteCards.length)
                }
            },
            $set: {lastActivity: new Date()}
        },
        {multi: true}
    );

    SelectedCards.remove({roomId: roomId});

    _getRandomBlackCard(roomId, true);
}
