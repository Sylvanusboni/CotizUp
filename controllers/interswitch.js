const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.INTERSWITCH_BASE_URL;
const clientId = process.env.INTERSWITCH_CLIENT_ID;
const secretKey = process.env.INTERSWITCH_SECRET_KEY;

const getAuthHeader = async () => {
    const token = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    return `Basic ${token}`;
};

exports.initiatePayment = async (amount, transactionRef, description, returnUrl) => {
    try {
        const authHeader = await getAuthHeader();
        const response = await axios.post(
            `${baseURL}/ipg/payments`,
            {
                amount,
                transactionRef,
                description,
                returnUrl,
                currency: "NGN", // Devise (à ajuster selon le cas)
            },
            {
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error initiating payment:', error.response?.data || error.message);
        throw new Error('Failed to initiate payment');
    }
};
