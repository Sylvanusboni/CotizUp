const TontineGroup = require('../models/Tontine/group.model');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontinePayment = require('../models/Tontine/payment.model');
const User = require('../models/user.model')

const TontineController = ({
    create: async(req, res) => {
        try {
            const { name, contributionAmount, cycleDuration, members, startDate } = req.body;

            if (!name || !contributionAmount || !cycleDuration || !members || !startDate) {
                return res.status(400).json({message: 'All fields are required'});
            }

            const tontine = new TontineGroup({
                name,
                admin: req.user.id,
                members,
                contributionAmount,
                cycleDuration,
                startDate,
                status: 'pending',
                totalCollected: 0,
            });
    
            await tontine.save();
    
            res.status(200).json({ message: 'Tontine created successfully', tontine });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    start: async(req, res) => {
        try {
            const {tontineId} = req.params;

            const tontine = await TontineGroup.findById(tontineId);
            if (!tontine) return res.status(404).json({ message: 'Tontine not found' });

            if (tontine.status !== 'pending') {
                return res.status(400).json({ message: 'Tontine already started or completed' });
            }

            const startDate = new Date(tontine.startDate);
            const cycleDuration = tontine.cycleDuration;
            const members = tontine.members;

            for (let i = 0; i < members.length; i++) {
                const cycle = new TontineCycle({
                    tontineId,
                    cycleNumber: i + 1,
                    beneficiary: members[i],
                    dueDate: new Date(startDate.getTime() + i * cycleDuration * 24 * 60 * 60 * 1000),
                    status: 'pending',
                    collectedAmount: 0,
                });
                await cycle.save();
            }

            tontine.status = 'active';
            await tontine.save();

            res.status(200).json({ message: 'Tontine started successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    },
    payCycleContribution: async(req, res) => {
        try {
            const {tontineId, cycleId} = req.params;
            const {amount} = req.body;

            const transactionRef = `TNT-${tontineId}-${cycleId}-${Date.now()}`;
    
            const paymentResponse = await initiatePayment(
                amount,
                transactionRef,
                `Payment for tontine cycle ${cycleId}`,
                `http://yourdomain.com/tontine/payment/callback`
            );
    
            const payment = new TontinePayment({
                tontineId,
                cycleId,
                memberId: req.user.id,
                amount,
                paymentDate: new Date(),
                paymentStatus: 'pending',
                transactionId: transactionRef,
            });
    
            await payment.save();
    
            res.status(200).json({
                message: 'Payment initiated successfully',
                data: paymentResponse,
            });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    getReport: async(req, res) => {
        try {
            const { tontineId } = req.params;
    
            const payments = await TontinePayment.find({tontineId});
            const report = payments.map((payment) => ({
                member: payment.memberId,
                amount: payment.amount,
                status: payment.paymentStatus,
            }));
    
            res.status(200).json({ message: 'Report generated', data: report });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    update: async(req, res) => {

    },
    get: async(req, res) => {

    },
    addMembers: async(req, res) => {

    },
    deleteMembers: async(req, res) => {

    }
});

cron.schedule('0 9 * * *', async () => {
    const pendingPayments = await TontinePayment.find({ paymentStatus: 'pending' });
    pendingPayments.forEach(async (payment) => {
        const user = await User.findById(payment.memberId);
        if (user) {
            await sendReminderEmail(user.email, payment.amount);
        }
    });
});