import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDn7oQHFaVfnCHrtY5B9RNPxrUkkbfSTz8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ledgerclean-2c9ee.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ledgerclean-2c9ee",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ledgerclean-2c9ee.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "336023816135",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:336023816135:web:ee8c107a9cd0b61ce47be2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-X71X8RZN8X"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Initializes Firebase Analytics & Performance Monitoring (100% Free Spark Plan)
 */
export async function initFirebaseMonitoring() {
  if (typeof window === 'undefined') return;

  try {
    const analyticsSupported = await isAnalyticsSupported();
    if (analyticsSupported) {
      const analytics = getAnalytics(app);
      logEvent(analytics, 'page_view');
    }

    try {
      getPerformance(app);
    } catch (perfErr) {
      // Performance monitoring optional in unsupported browser environments
    }
  } catch (err) {
    console.warn('Firebase Monitoring initialization fallback:', err);
  }
}

/**
 * Track conversion & export user actions in Firebase Analytics
 */
export async function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    const analyticsSupported = await isAnalyticsSupported();
    if (analyticsSupported) {
      const analytics = getAnalytics(app);
      logEvent(analytics, eventName, params);
    }
  } catch (err) {
    console.warn('Firebase Event tracking fallback:', err);
  }
}
