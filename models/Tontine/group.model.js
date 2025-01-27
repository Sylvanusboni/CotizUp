const mongoose = require('mongoose')

const TontineGroup = new mongoose.Schema({
    name: String,
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    contributionAmount: Number,
    cycleDuration: Number,
    startDate: Date,
    status: String,
    totalCollected: Number,
});

module.exports = mongoose.model('TontineGroup', TontineGroup);