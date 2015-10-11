var blackCardsInRoom = {},
    whiteCardsInRoom = {},
    maxCardCount = {},
    namesInUse = [];

var Twit = Npm.require('twit');

const ROOM_ID = 'roomId_hard1';

Names = new Mongo.Collection('names');
BlackCards = new Mongo.Collection("blackCards");
CurrentBlackCards = new Mongo.Collection("currentBlackCards");
WhiteCards = new Mongo.Collection("whiteCards");
SelectedCards = new Mongo.Collection("selectedCards");
Twitter = new Mongo.Collection("twitter");

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

    var players;

    players = Players.find({lastActivity: {$lte: new Date(new Date() - 3 * 60 * 1000)}}).fetch();

    _.each(players, function(player) {

        _exitGame(player.roomId, player.name);
    });

}, 10 * 1000);

Meteor.setInterval(function () {

    _endRound(ROOM_ID);
}, 1 * 60 * 1000);

Meteor.methods({

    initiatePlayer: _initiatePlayer,
    playerSelectedCard: _playerSelectedCard,
    playerVotedForCard: _playerVotedForCard,
    endRound: _endRound,
    exitGame: _exitGame
});

function _getRandomBlackCard(roomId, regenerate) {

    let card, randomId, blackCards;

    console.log('packages/cards/cards.js', 'getting random black card for room', roomId);

    card = CurrentBlackCards.findOne({roomId: roomId});

    card = card && card.card;

    // If there is a card assigned to this room, then use that card.
    // If there isn't any card assigned to this room, then generate new card.
    if (!blackCardsInRoom[roomId]) {

        console.log('no black cards in the room');

        blackCards = BlackCards.find({}).fetch();
        blackCardsInRoom[roomId] = _.pluck(blackCards, 'text');

        regenerate = true;
    }

    if (regenerate) {

        if (blackCardsInRoom[roomId].length <= 0) {

            console.error('No more black cards for room:', roomId);

            blackCards = BlackCards.find({}).fetch();
            blackCardsInRoom[roomId] = _.pluck(blackCards, 'text');
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
        randomId,
        whiteCards;

    console.log('packages/cards/cards.js', 'getting random ', count, ' white cards for room', roomId);

    if (!whiteCardsInRoom[roomId]) {

        whiteCards = WhiteCards.find({}).fetch();

        whiteCardsInRoom[roomId] = _.pluck(whiteCards, 'text');
    }

    if (whiteCardsInRoom[roomId].length <= 0) {

        console.error('No more white cards for room:', roomId);

        whiteCards = WhiteCards.find({}).fetch();

        whiteCardsInRoom[roomId] = _.pluck(whiteCards, 'text');
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

function _initiatePlayer(roomId) {

    var name = _getName();

    var count = Players.find({roomId: roomId}).count();

    if (count >= 10) {
        throw new Meteor.Error('Room is full');
    }

    var player = {
        name: name,
        roomId: roomId,
        score: 0,
        cards: _getRandomWhiteCards(roomId, 10),
        lastActivity: new Date(),
        canVote: true
    };

    Players.insert(player);

    return name;
}

function _getName() {

    var query = {name: {$nin: namesInUse}};
    var name = Names.findOne(query, {skip: _.random(0, Names.find(query).count())}).name;
    namesInUse.push(name);
    return name;
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

    var playerCard,
        player;

    player = Players.findOne({name: playerName, roomId: roomId});

    if(!player.canVote) {

        console.error('player already voted');
        throw new Meteor.Error('player already voted');
    }

    Players.update(
        {
            _id: player._id
        },
        {
            $set: {lastActivity: new Date(), canVote: false}
        }
    );

    playerCard = SelectedCards.findOne({_id: selectedCardsId, player: playerName});

    if (playerCard) {
        console.error('player cannot vote for own card');
        throw new Meteor.Error('player cannot vote for his own card');
    }

    SelectedCards.update({_id: selectedCardsId}, {$inc: {votes: 1}});
    return;
}

function _endRound(roomId) {
    console.log('ending round');
    var winningCards,
        players,
        count;

    winningCards = SelectedCards.findOne({}, {sort: {votes: -1}, fields: {_id: 0}});

    if(!winningCards) {
        console.log('there are no WinningCards');
        return;
    }

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

    players = Players.find({roomId: roomId}).fetch();

    _.each(players, function(player){

        if(player.cards.length <= 10) {

            count = 10 - player.cards.length;
            Players.update(
                {_id: player._id},
                {
                    $push: {
                        cards: {
                            $each: _getRandomWhiteCards(roomId, count)
                        }
                    },
                    $set: {canVote: true}
                }
            );
        }
    });

    SelectedCards.remove({roomId: roomId});

    _getRandomBlackCard(roomId, true);

    _tweet(winningCards);
}

function _tweet(winningCards) {
    console.log('_tweet');
    var twitterCredentials,
        authHeaders,
        message,
        hashtag,
        T;

    message = winningCards.blackCard;

    twitterCredentials = Twitter.findOne({_id:'1'});

    if(twitterCredentials) {

        T = new Twit({
            consumer_key: twitterCredentials.apiKey,
            consumer_secret: twitterCredentials.apiSecret,
            access_token: twitterCredentials.userKey,
            access_token_secret: twitterCredentials.userSecret
        });

        if(message.search("_") === -1) {
            message = message + ' ' + winningCards.whiteCards[0];
        } else {

            _.each(winningCards.whiteCards, function (whiteCard) {
                message = message.replace('_', whiteCard);
            });
        }
        hashtag = ' #cardsagainsthumanity';

        if(message.length <= 140) {

            if(message.length + hashtag.length <= 140) {
                message = message + hashtag;
            }

            console.log('tweeting message', message);

            T.post('statuses/update', { status: message }, function(err, data, response) {
                if(err) {
                    console.error(err, 'error tweeting message');
                    return;
                }
                console.log('message tweeted');
            });
        } else {
            console.error('message too big :(');
        }
        return;
    }

    console.error('Twitter not configured');
}

function _exitGame(roomId, playerName) {

    var player;

    player = Players.findOne({name: playerName, roomId: roomId});

    if(player) {

        whiteCardsInRoom[roomId] = _.union(whiteCardsInRoom[roomId], player.cards);
        Players.remove({_id: player._id});
    }
}
