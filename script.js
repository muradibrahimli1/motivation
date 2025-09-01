// Configuration - Load from external config file
const CONFIG = {
    ...APP_CONFIG,
    // Fallback values if config file is not loaded
    MAX_FILE_SIZE: APP_CONFIG?.MAX_FILE_SIZE || 2 * 1024 * 1024,
    SUPPORTED_FORMATS: APP_CONFIG?.SUPPORTED_FORMATS || ['.txt', '.md', '.pdf', '.docx'],
    N8N_WEBHOOK_URL: APP_CONFIG?.N8N_WEBHOOK_URL || '',
    TOAST_TIMEOUT: APP_CONFIG?.TOAST_TIMEOUT || 5000
};

// State management
const state = {
    currentText: '',
    originalText: '',
    enhancedText: '',
    currentTab: 'paste',
    isAnalyzing: false,
    fileData: null
};

// DOM elements
const elements = {
    // Tabs
    pasteTab: document.getElementById('paste-tab'),
    uploadTab: document.getElementById('upload-tab'),
    pastePanel: document.getElementById('paste-panel'),
    uploadPanel: document.getElementById('upload-panel'),

    // Input
    letterText: document.getElementById('letter-text'),
    charCounter: document.getElementById('char-counter'),
    fileInput: document.getElementById('file-input'),
    filePicker: document.getElementById('file-picker'),
    uploadArea: document.getElementById('upload-area'),
    fileInfo: document.getElementById('file-info'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    fileStatus: document.getElementById('file-status'),
    removeFile: document.getElementById('remove-file'),

    // Analyze
    analyzeButton: document.getElementById('analyze-button'),
    loadingSpinner: document.getElementById('loading-spinner'),

    // Output
    outputSection: document.getElementById('output-section'),
    originalText: document.getElementById('original-text'),
    enhancedText: document.getElementById('enhanced-text'),
    diffToggle: document.getElementById('diff-toggle'),
    diffView: document.getElementById('diff-view'),
    diffContent: document.getElementById('diff-content'),

    // Actions
    copyOriginal: document.getElementById('copy-original'),
    copyEnhanced: document.getElementById('copy-enhanced'),
    downloadEnhanced: document.getElementById('download-enhanced'),

    // Toast
    toastContainer: document.getElementById('toast-container')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupTabNavigation();
    setupFileHandling();
    setupTextInput();
    setupActions();

    // Check if webhook URL is configured
    if (!CONFIG.N8N_WEBHOOK_URL) {
        showToast('warning', 'Configuration Required', 'Please configure the N8N webhook URL in the script configuration.');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Tab switching
    elements.pasteTab.addEventListener('click', () => switchTab('paste'));
    elements.uploadTab.addEventListener('click', () => switchTab('upload'));

    // File handling
    elements.filePicker.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFile.addEventListener('click', removeFile);

    // Drag and drop
    setupDragAndDrop();

    // Text input
    elements.letterText.addEventListener('input', handleTextInput);

    // Analyze button
    elements.analyzeButton.addEventListener('click', analyzeLetter);

    // Output actions
    elements.diffToggle.addEventListener('click', toggleDiffView);
    elements.copyOriginal.addEventListener('click', () => copyText(state.originalText, 'Original text'));
    elements.copyEnhanced.addEventListener('click', () => copyText(state.enhancedText, 'Enhanced text'));
    elements.downloadEnhanced.addEventListener('click', downloadEnhancedText);

    // Keyboard navigation
    setupKeyboardNavigation();
}

// Tab Navigation
function setupTabNavigation() {
    // Tab switching logic is handled in setupEventListeners
}

function switchTab(tabName) {
    // Update active tab
    if (tabName === 'paste') {
        elements.pasteTab.setAttribute('aria-selected', 'true');
        elements.uploadTab.setAttribute('aria-selected', 'false');
        elements.pasteTab.classList.add('active');
        elements.uploadTab.classList.remove('active');
        elements.pastePanel.classList.add('active');
        elements.uploadPanel.classList.remove('active');
    } else {
        elements.uploadTab.setAttribute('aria-selected', 'true');
        elements.pasteTab.setAttribute('aria-selected', 'false');
        elements.uploadTab.classList.add('active');
        elements.pasteTab.classList.remove('active');
        elements.uploadPanel.classList.add('active');
        elements.pastePanel.classList.remove('active');
    }

    state.currentTab = tabName;
    updateAnalyzeButton();
}

// File Handling
function setupFileHandling() {
    // File handling logic is handled in setupEventListeners
}

function setupDragAndDrop() {
    const uploadArea = elements.uploadArea;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('dragover');
    }

    function unhighlight() {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            handleFile(files[0]);
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }

    // Store file data
    state.fileData = file;

    // Display file info
    displayFileInfo(file);

    // Extract text based on file type
    extractTextFromFile(file);
}

function validateFile(file) {
    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('error', 'File Too Large', `File size must be less than ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`);
        return false;
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!CONFIG.SUPPORTED_FORMATS.includes(extension)) {
        showToast('error', 'Unsupported Format', `Please use one of these formats: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`);
        return false;
    }

    return true;
}

function displayFileInfo(file) {
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.style.display = 'block';
    elements.fileStatus.textContent = 'Processing file...';
    elements.fileStatus.className = 'file-status warning';
}

function extractTextFromFile(file) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (extension === '.txt' || extension === '.md') {
        extractTextFile(file);
    } else if (extension === '.pdf') {
        extractPdfText(file);
    } else if (extension === '.docx') {
        extractDocxText(file);
    }
}

function extractTextFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        state.currentText = text;
        state.originalText = text;
        updateFileStatus('success', 'Text extracted successfully');
        updateAnalyzeButton();
        updateCharCounter();
    };
    reader.onerror = () => {
        updateFileStatus('error', 'Failed to read file');
    };
    reader.readAsText(file);
}

function extractPdfText(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map(item => item.str).join(' ') + '\n';
            }

            if (text.trim()) {
                state.currentText = text;
                state.originalText = text;
                updateFileStatus('success', 'PDF text extracted successfully');
            } else {
                updateFileStatus('warning', 'No text found in PDF. Please paste the text manually.');
            }
        } catch (error) {
            console.error('PDF extraction error:', error);
            updateFileStatus('error', 'Failed to extract PDF text. Please paste the text manually.');
        }

        updateAnalyzeButton();
        updateCharCounter();
    };
    reader.readAsArrayBuffer(file);
}

function extractDocxText(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
            const text = result.value;

            if (text.trim()) {
                state.currentText = text;
                state.originalText = text;
                updateFileStatus('success', 'DOCX text extracted successfully');
            } else {
                updateFileStatus('warning', 'No text found in DOCX. Please paste the text manually.');
            }
        } catch (error) {
            console.error('DOCX extraction error:', error);
            updateFileStatus('error', 'Failed to extract DOCX text. Please paste the text manually.');
        }

        updateAnalyzeButton();
        updateCharCounter();
    };
    reader.readAsArrayBuffer(file);
}

function updateFileStatus(type, message) {
    elements.fileStatus.textContent = message;
    elements.fileStatus.className = `file-status ${type}`;
}

function removeFile() {
    state.fileData = null;
    state.currentText = '';
    elements.fileInfo.style.display = 'none';
    elements.fileInput.value = '';
    updateAnalyzeButton();
    updateCharCounter();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Text Input
function setupTextInput() {
    // Text input logic is handled in setupEventListeners
}

function handleTextInput() {
    const text = elements.letterText.value;
    state.currentText = text;
    state.originalText = text;
    updateCharCounter();
    updateAnalyzeButton();
}

function updateCharCounter() {
    const count = state.currentText.length;
    elements.charCounter.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function updateAnalyzeButton() {
    const hasContent = state.currentText.trim().length > 0;
    elements.analyzeButton.disabled = !hasContent || state.isAnalyzing;
}

// Analysis
async function analyzeLetter() {
    if (!CONFIG.N8N_WEBHOOK_URL) {
        showToast('error', 'Configuration Error', 'N8N webhook URL is not configured. Please check the script configuration.');
        return;
    }

    if (!state.currentText.trim()) {
        showToast('error', 'No Content', 'Please provide some text to analyze.');
        return;
    }

    // Set loading state
    setLoadingState(true);

    try {
        // Send to N8N webhook
        const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: state.currentText,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const jsonResult = JSON.parse(result.enhancedText)
        // Handle the response
        if (result.enhancedText) {
            state.enhancedText = jsonResult.improved_text;
            displayResults();
            showToast('success', 'Analysis Complete', 'Your motivation letter has been enhanced successfully!');
        } else {
            throw new Error('No enhanced text received from the API');
        }

    } catch (error) {
        console.error('Analysis error:', error);
        showToast('error', 'Analysis Failed', 'Failed to enhance your letter. Please try again or check your connection.');
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    state.isAnalyzing = loading;

    if (loading) {
        elements.loadingSpinner.style.display = 'block';
        elements.analyzeButton.querySelector('.button-text').textContent = 'Analyzing...';
        elements.analyzeButton.disabled = true;
    } else {
        elements.loadingSpinner.style.display = 'none';
        elements.analyzeButton.querySelector('.button-text').textContent = 'Analyze Letter';
        updateAnalyzeButton();
    }
}

function displayResults() {
    // Show output section
    elements.outputSection.style.display = 'block';

    // Display texts
    elements.originalText.textContent = state.originalText;
    elements.enhancedText.textContent = state.enhancedText;

    // Scroll to output
    elements.outputSection.scrollIntoView({ behavior: 'smooth' });
}

// Output Actions
function setupActions() {
    // Actions logic is handled in setupEventListeners
}

function toggleDiffView() {
    const isPressed = elements.diffToggle.getAttribute('aria-pressed') === 'true';

    if (isPressed) {
        // Hide diff
        elements.diffToggle.setAttribute('aria-pressed', 'false');
        elements.diffToggle.textContent = 'Show Diff';
        elements.diffView.style.display = 'none';
    } else {
        // Show diff
        elements.diffToggle.setAttribute('aria-pressed', 'true');
        elements.diffToggle.textContent = 'Hide Diff';
        elements.diffView.style.display = 'block';
        generateDiff();
    }
}

function generateDiff() {
    try {
        // Use diff2html to generate diff
        const diff = Diff2Html.html(Diff2Html.parse(state.originalText, state.enhancedText), {
            drawFileList: false,
            matching: 'lines',
            outputFormat: 'side-by-side'
        });

        elements.diffContent.innerHTML = diff;
    } catch (error) {
        console.error('Diff generation error:', error);
        elements.diffContent.innerHTML = '<p class="text-red-600">Failed to generate diff view. Please try again.</p>';
    }
}

async function copyText(text, description) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('success', 'Copied!', `${description} copied to clipboard`);
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('error', 'Copy Failed', 'Failed to copy text to clipboard');
    }
}

function downloadEnhancedText() {
    if (!state.enhancedText) {
        showToast('error', 'No Content', 'No enhanced text to download');
        return;
    }

    const blob = new Blob([state.enhancedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-motivation-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', 'Downloaded!', 'Enhanced text downloaded successfully');
}

// Toast Notifications
function showToast(type, title, message) {
    const toast = createToast(type, title, message);
    elements.toastContainer.appendChild(toast);

    // Auto-remove after timeout
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, CONFIG.TOAST_TIMEOUT);
}

function createToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);

    toast.innerHTML = `
        ${icon}
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());

    return toast;
}

function getToastIcon(type) {
    const icons = {
        success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M22 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
            <path d="M2 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
        </svg>`,
        error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`,
        warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y1="13"></line>
            <line x1="12" y1="17" x2="12.01" y1="17"></line>
        </svg>`,
        info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y1="12"></line>
            <line x1="12" y1="8" x2="12.01" y1="8"></line>
        </svg>`
    };

    return icons[type] || icons.info;
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    // Tab navigation with arrow keys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey) {
            // Handle shift+tab navigation
            return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const tabs = [elements.pasteTab, elements.uploadTab];
            const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));

            if (currentIndex !== -1) {
                let newIndex;
                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                    newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }

                tabs[newIndex].click();
                e.preventDefault();
            }
        }

        // Enter key on analyze button
        if (e.key === 'Enter' && document.activeElement === elements.analyzeButton && !elements.analyzeButton.disabled) {
            analyzeLetter();
            e.preventDefault();
        }
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showToast('error', 'Application Error', 'An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('error', 'Application Error', 'An unexpected error occurred. Please refresh the page.');
});

// Export for testing/debugging
if (typeof window !== 'undefined') {
    window.MotivationLetterEnhancer = {
        state,
        elements,
        showToast,
        analyzeLetter,
        switchTab
    };
}
