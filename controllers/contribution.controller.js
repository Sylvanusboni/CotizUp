const Contribution = require('../models/Contribution/contribution.model');
const ContributionGroup = require('../models/Contribution/group.model');

const contributionController = ({
    createGroup: async(req, res) => {
        try {
            const { name, description, frequency, contributionAmount } = req.body;
    
            const newGroup = new ContributionGroup({
                name,
                description,
                admin: req.user.id,
                frequency,
                contributionAmount,
            });
    
            await newGroup.save();
            res.status(200).json({ message: 'Group created successfully', data: newGroup });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    inviteMembers: async(req, res) => {
        try {
            const { groupId, emails } = req.body;
    
            const group = await ContributionGroup.findById(groupId);
            if (!group) return res.status(404).json({ message: 'Group not found' });
    
            if (group.admin.toString() !== req.user.id)
                return res.status(403).json({ message: 'Only admin can invite members' });
    
            emails.forEach((email) => {
                //group.members.push({email, status: 'pending'});
            });
    
            await group.save();
            res.status(200).json({ message: 'Invitations sent successfully', data: group });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }    
    }
})
