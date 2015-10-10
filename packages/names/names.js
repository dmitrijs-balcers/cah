Names = new Mongo.Collection('names');

var namesInUse = [];

Meteor.methods({
    getName: function () {

        var query = {name: {$nin: namesInUse}};

        var name = Names.findOne(query, {skip: _.random(0, Names.find(query).count())}).name;

        namesInUse.push(name);

        return name;
    }
});