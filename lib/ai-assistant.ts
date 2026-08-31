import { Transaction } from './types';
import { STANDARD_CATEGORIES } from './categorizer';

/**
 * AI Transaction Assistant Engine using Gemini 2.5 Flash via Firebase AI Services
 */
export async function categorizeTransactionsWithAI(
  transactions: Transaction[],
  apiKey: string = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDn7oQHFaVfnCHrtY5B9RNPxrUkkbfSTz8"
): Promise<{ updatedTransactions: Transaction[]; processedCount: number }> {
  // Find transactions that need categorization or review
  const targetTxs = transactions.filter(
    (tx) => tx.needsReview || tx.category === 'Uncategorized / Review' || !tx.category
  );

  if (targetTxs.length === 0) {
    return { updatedTransactions: transactions, processedCount: 0 };
  }

  // Limit batch size to 25 items per request for fast response
  const batch = targetTxs.slice(0, 25);
  const promptItems = batch.map((tx) => ({
    id: tx.id,
    description: tx.description,
    debit: tx.debit,
    credit: tx.credit,
  }));

  const promptText = `You are a professional CPA & Bank Statement Bookkeeper. Categorize each transaction into EXACTLY ONE of these standard accounting categories:
${JSON.stringify(STANDARD_CATEGORIES)}

Transactions to categorize:
${JSON.stringify(promptItems, null, 2)}

Return strictly a JSON array of objects with fields "id" and "category" (no extra markdown explanation):
[{"id": "...", "category": "..."}]`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API response not OK:', response.statusText);
      throw new Error(`Gemini AI service error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsed: Array<{ id: string; category: string }> = JSON.parse(rawText);

    const categoryMap = new Map<string, string>();
    parsed.forEach((item) => {
      if (item.id && item.category && STANDARD_CATEGORIES.includes(item.category as any)) {
        categoryMap.set(item.id, item.category);
      }
    });

    // Update transactions with AI categorized values
    let processedCount = 0;
    const updatedTransactions = transactions.map((tx) => {
      if (categoryMap.has(tx.id)) {
        processedCount++;
        return {
          ...tx,
          category: categoryMap.get(tx.id)!,
          categoryConfidence: 1.0,
          needsReview: false,
          isEdited: true,
          reviewReason: undefined,
        };
      }
      return tx;
    });

    return { updatedTransactions, processedCount };
  } catch (err) {
    console.error('Gemini AI Categorization error:', err);
    // Fallback: Return original transactions safely
    return { updatedTransactions: transactions, processedCount: 0 };
  }
}
