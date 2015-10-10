var blackCardsInRoom = {},
    whiteCardsInRoom = {},
    currentBlackCard = {},
    maxCardCount = {};

BlackCards = new Mongo.Collection("blackCards");
WhiteCards = new Mongo.Collection("whiteCards");
SelectedCards = new Mongo.Collection("selectedCards");
Players = new Mongo.Collection("players");

Meteor.methods({

    getRandomBlackCard : _getRandomBlackCard,
    setMaxCardCount: _setMaxCardCount,
    initiatePlayer: _initiatePlayer,
    playerSelectedCard: _playerSelectedCard,
    playerVotedForCard: _playerVotedForCard,
    endRound: _endRound,
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

    currentBlackCard[roomId] = card;

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

function _setMaxCardCount(roomId, count) {

    maxCardCount[roomId] = count;
}

function _initiatePlayer(roomId, name) {

    var player = {
        name: name,
        roomId: roomId,
        score: 0,
        cards: _getRandomWhiteCards(roomId, 10)
    };

    Players.insert(player);
}

function _playerSelectedCard(roomId, playerName, card) {

    var cards;

    cards = SelectedCards.find({player: playerName}).fetch();

    if(!cards || !cards.whiteCards || cards.whiteCards.length < maxCardCount[roomId]) {

        console.log(playerName, 'selected white card', card);

        Player.update(
            {
                name: playerName,
                roomId: roomId
            },
            {
                $pull: {
                        cards: card
                    }
            }
        );

        if(cards && cards.whiteCards) {

            SelectedCards.update(
                {
                    player: playerName,
                    roomId: roomId
                },
                {
                    $push: {
                            whiteCards: card
                        }
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

function _playerVotedForCard(playerName, selectedCardsId) {

    var playerCard;

    playerCard = SelectedCards.findOne({_id: selectedCardsId});

    if(card) {
        console.error('player cannot vote for own card');
        throw new Meteor.error('player cannot vote for his own card');
    }

    SelectedCards.update({_id: selectedCardsId}, {$inc: {votes: 1}});
}

function _endRound(roomId) {

    var winningCards;

    winningCards = SelectedCards.findOne({}, {sort: {votes:1}});
    winningCards.blackCard = currentBlackCard[roomId];

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
        {
            roomId: roomId
        },
        {
            $push: {
                $each: _getRandomWhiteCards(roomId, winningCards.whiteCards.length)
            }
        },
        {
            multi: true
        }
    );

    SelectedCards.remove(
        {
            roomId: roomId
        },
        {
            multi: true
        }
    );
}
