const mongoose = require('mongoose');

const ContributionGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }, 
        },
    ],
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true }, 
    contributionAmount: { type: Number, required: true },
    totalCollected: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContributionGroup', ContributionGroupSchema);