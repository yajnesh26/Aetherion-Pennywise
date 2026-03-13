const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/aiService');
const { generateCoachInsights } = require('../services/financialCoachService');
const { db } = require('../config/firebase');

router.post('/chat', async (req, res) => {
    const { message, history, userId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        let userContext = null;

        // Fetch user data from database if userId is provided
        if (userId) {
            try {
                const [userDoc, goalsSnap, txsSnap] = await Promise.all([
                    db.collection('users').doc(userId).get(),
                    db.collection('goals').where('uid', '==', userId).orderBy('createdAt', 'desc').get(),
                    db.collection('transactions').where('uid', '==', userId).orderBy('createdAt', 'desc').get()
                ]);

                const userData = userDoc.exists ? userDoc.data() : {};
                const goals = goalsSnap.docs.map(doc => doc.data());
                const transactions = txsSnap.docs.map(doc => doc.data());
                
                userContext = {
                    bankBalance: userData.bankBalance || 0,
                    walletSavings: userData.walletSavings || 0,
                    goals,
                    transactions
                };
            } catch (dbError) {
                console.error("Database fetch error:", dbError.message);
                // Continue without context if DB fetch fails
            }
        }

        const response = await getChatResponse(message, history, userContext);
        res.json({ response });
    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ 
            error: "Failed to fetch response from AI",
            details: error.message 
        });
    }
});

const { analyzeSpending } = require('../services/spendingAnalyzer');

router.get('/spending-analysis/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const txsSnap = await db.collection('transactions')
            .where('uid', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const transactions = txsSnap.docs.map(doc => doc.data());
        const analysis = analyzeSpending(transactions);

        res.json(analysis);
    } catch (error) {
        console.error("Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to analyze spending pattern" });
    }
});

router.get('/coaching/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [userDoc, goalsSnap, txsSnap] = await Promise.all([
            db.collection('users').doc(userId).get(),
            db.collection('goals').where('uid', '==', userId).get(),
            db.collection('transactions').where('uid', '==', userId).orderBy('createdAt', 'desc').get()
        ]);

        const user = userDoc.exists ? userDoc.data() : { bankBalance: 0, walletSavings: 0 };
        const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const transactions = txsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const coachingData = await generateCoachInsights(user, goals, transactions);
        res.json(coachingData);
    } catch (error) {
        console.error("Coaching Error:", error.message);
        res.status(500).json({ error: "Failed to generate coaching insights" });
    }
});

module.exports = router;
