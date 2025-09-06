import { firestore } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { LanguageServiceClient } from "@google-cloud/language";

initializeApp();

const languageClient = new LanguageServiceClient();

// Calculates risk level based on sentiment
const getRiskLevel = (score: number): number => {
  if (score < -0.7) return 5; // High risk
  if (score < -0.4) return 4; // Elevated risk
  if (score < -0.1) return 3; // Moderate risk
  if (score < 0.1) return 2;  // Low risk
  return 1; // Minimal risk
};

// Analyzes the sentiment of a user's journal entry
export const analyzeSentiment = firestore.document("/users/{userId}/journal/{entryId}").onCreate(async (snap, context) => {
  const { content } = snap.data();
  const { userId } = context.params;

  try {
    const [result] = await languageClient.analyzeSentiment({ document: { content, type: "PLAIN_TEXT" } });
    const score = result.documentSentiment?.score ?? 0;
    const riskLevel = getRiskLevel(score);

    await getFirestore().collection("users").doc(userId).set({ riskLevel }, { merge: true });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
  }
});
