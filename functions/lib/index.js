"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingAi = void 0;
const firebase_functions_1 = require("firebase-functions");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const httpsClient = require("https");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const getSystemPrompt = (history) => {
    const historyString = history.map(h => `${h.from}: ${h.text}`).join('\n');
    return `You are Milo, a friendly and empathetic AI wellness companion. Your goal is to guide a new user through onboarding. Be warm, encouraging, and brief.

    The user has already signed up. Now, you need to ask a series of questions to personalize their wellness plan. Ask one question at a time.

    **Onboarding Questions:**
    1.  Start with a warm welcome and ask for their name.
    2.  Ask about their working hours (e.g., "What time do you typically start and end your day?").
    3.  Ask about their free time (e.g., "When do you usually have breaks or free time?").
    4.  Ask about their current mood (e.g., "How are you feeling today?").
    5.  Ask about their wellness goals (e.g., "What do you hope to achieve with Milo?").
    6.  Ask for a trusted contact (e.g., "Who is your go-to person for support? Please provide their phone number. This is for your safety.").
    7.  Once all questions are answered, respond with a confirmation message and use the phrase "plan is being created".

    **Current Conversation:**
    ${historyString}

    Based on the conversation history, what is the next single question you should ask? If all questions have been answered, respond with a confirmation message and use the phrase "plan is being created".
    `;
};
exports.onboardingAi = firebase_functions_1.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new firebase_functions_1.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const userDocRef = db.collection('users').doc(uid);
    try {
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists && ((_a = userDocSnap.data()) === null || _a === void 0 ? void 0 : _a.onboardingComplete)) {
            throw new firebase_functions_1.https.HttpsError('already-exists', 'Onboarding is already complete for this user.');
        }
        const apiKey = (0, firebase_functions_1.config)().gemini.key;
        const { history } = data;
        const prompt = getSystemPrompt(history);
        const postData = JSON.stringify({
            "contents": [{ "parts": [{ "text": prompt }] }]
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };
        const aiResponse = await new Promise((resolve, reject) => {
            const req = httpsClient.request(options, (res) => {
                let buffer = '';
                res.on('data', (chunk) => buffer += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(buffer);
                        if (parsed.error) {
                            console.error("Gemini API Error:", parsed.error);
                            reject(new firebase_functions_1.https.HttpsError('internal', `AI API Error: ${parsed.error.message}`));
                            return;
                        }
                        resolve(parsed.candidates[0].content.parts[0].text);
                    }
                    catch (e) {
                        console.error("Failed to parse AI response. Buffer:", buffer, "Error:", e);
                        reject(new firebase_functions_1.https.HttpsError('internal', 'Failed to parse AI response.'));
                    }
                });
            });
            req.on('error', (e) => reject(new firebase_functions_1.https.HttpsError('internal', 'AI API request failed.')));
            req.write(postData);
            req.end();
        });
        const isComplete = aiResponse.toLowerCase().includes("plan is being created");
        const lastUserMessage = history[history.length - 1].text;
        const conversationTurn = [
            { from: "user", text: lastUserMessage },
            { from: "ai", text: aiResponse }
        ];
        const propertiesToUpdate = {
            onboardingHistory: firestore_1.FieldValue.arrayUnion(...conversationTurn)
        };
        if (history.length === 2) { // First user message is their name
            propertiesToUpdate.name = lastUserMessage;
        }
        if (isComplete) {
            propertiesToUpdate.onboardingComplete = true;
        }
        if (userDocSnap.exists) {
            await userDocRef.update(propertiesToUpdate);
        }
        else {
            await userDocRef.set(propertiesToUpdate);
        }
        return { question: aiResponse, isComplete };
    }
    catch (error) {
        console.error("Error in onboarding AI function:", error);
        if (error instanceof firebase_functions_1.https.HttpsError) {
            throw error;
        }
        throw new firebase_functions_1.https.HttpsError('internal', 'An error occurred while processing your request.');
    }
});
//# sourceMappingURL=index.js.map