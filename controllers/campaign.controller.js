const Campaign = require('../models/campaign.model');
const Contribution = require('../models/contribution.model');

const campaignController = ({
    create: async (req, res) => {
        try {
            const { title, description, goalAmount } = req.body;
            
            const newCampaign = new Campaign({
                title,
                description,
                goalAmount,
                createdBy: req.user.id,
            });

            await newCampaign.save();
            res.status(201).json({ message: 'Campaign created successfully', data: newCampaign });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },
    get: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limits = req.query.limit || 10;
    
            const campaigns = await Campaign.find().limit(limits).skip((page - 1) * limits).populate('createdBy', 'name email');
            res.status(200).json(campaigns);    
        } catch (error) {
            res.status(404).json({message: 'Campaign getting error', error: error.message});
        }
    },
    donateToCampaign: async (req, res) => {
        try {
            const { campaignId, userId, amount } = req.body;
            const campaign = await Campaign.findById(campaignId);
    
            if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
            campaign.collectedAmount += amount;
            campaign.contributors.push({userId, amount});
            await campaign.save();

            res.status(200).json({message: 'Donation successful', data: campaign});    
        } catch (error) {
            res.status(404).json({
                message: 'Donnation Error',
                error: error.message
            });
        }
    },
    externalContribution: async (req, res) => {
        try {
            const { campaignId, amount, email } = req.body;

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
            const newContribution = new Contribution({
                campaignId,
                email,
                amount,
            });
    
            await newContribution.save();
    
            campaign.collectedAmount += amount;
            campaign.externalContributions.push({ email, amount });
            await campaign.save();
    
            res.status(200).json({ message: 'Contribution successful', data: newContribution });
        } catch (error) {
            res.status(404).json({
                message: 'Donnation Error',
                error: error.message
            });
        }
    }
})

module.exports = campaignController;