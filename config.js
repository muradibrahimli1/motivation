// Configuration file for Motivation Letter Enhancer
// Update these values according to your setup

const APP_CONFIG = {
    // N8N Webhook Configuration
    N8N_WEBHOOK_URL: 'https://n8n.dayeler.com/webhook/motivation-letter-enhancer', // ← Your N8N webhook URL
    
    // File Settings
    MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB in bytes
    SUPPORTED_FORMATS: ['.txt', '.md', '.pdf', '.docx'],
    
    // UI Settings
    TOAST_TIMEOUT: 5000, // Toast notification display time in milliseconds
    
    // API Settings
    REQUEST_TIMEOUT: 30000, // API request timeout in milliseconds
    
    // Feature Flags
    ENABLE_DIFF_VIEW: true,
    ENABLE_FILE_UPLOAD: true,
    ENABLE_COPY_FEATURE: true,
    ENABLE_DOWNLOAD_FEATURE: true
};

// Example N8N webhook URLs:
// - Local development: 'http://localhost:5678/webhook/motivation-letter'
// - Self-hosted: 'https://your-domain.com/webhook/motivation-letter'
// - Cloud instance: 'https://your-instance.n8n.cloud/webhook/motivation-letter'

// Example configuration:
// N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/motivation-letter'

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
} else if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}
