// Google Analytics Configuration for Tawafuq Project
const TAWAFUQ_ID = 'G-11RWJ9C9B8';

// Active ID for this standalone project
const GA_MEASUREMENT_ID = TAWAFUQ_ID;

// Global Analytics Helper
window.tracker = {
    // Send a page view
    pageView: (pagePath, pageTitle) => {
        if (typeof gtag !== 'undefined') {
            gtag('config', GA_MEASUREMENT_ID, {
                page_path: pagePath,
                page_title: pageTitle
            });
            console.log(`[GA] ${GA_MEASUREMENT_ID} Trace: Page Viewed -> ${pagePath}`);
        }
    },
    // Send a custom event
    event: (eventName, eventParams = {}) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventParams);
            console.log(`[GA] ${GA_MEASUREMENT_ID} Trace: Event -> ${eventName}`, eventParams);
        }
    }
};

// Log Initialization
if (GA_MEASUREMENT_ID && !GA_MEASUREMENT_ID.includes('XXXXXXXXXX')) {
    console.log(`[GA] ${GA_MEASUREMENT_ID} initialized for Tawafuq Platform.`);
} else {
    console.warn(`[GA] Measurement ID (${GA_MEASUREMENT_ID}) is missing. Using local mock.`);
    // Mock gtag for local testing to avoid errors
    window.gtag = function() {
        console.log('[GA Mock] gtag call:', arguments);
    };
}
