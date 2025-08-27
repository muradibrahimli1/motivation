# Motivation Letter Enhancer

A production-ready web application that enhances motivation letters using AI-powered analysis. Users can upload or paste their motivation letters, send them to an N8N webhook for enhancement, and view the improved version with a side-by-side diff comparison.

## Features

### ✨ Core Functionality
- **Dual Input Methods**: Paste text directly or upload files (.txt, .md, .pdf, .docx)
- **AI Enhancement**: Send letters to N8N webhook for AI-powered improvement
- **Side-by-Side Comparison**: View original and enhanced versions simultaneously
- **Diff View**: Toggle inline diff view to see exact changes
- **Export Options**: Copy text or download enhanced version as .txt file

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Mobile First**: Responsive layout that works on all devices
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support
- **Toast Notifications**: Non-blocking success/error messages
- **Loading States**: Visual feedback during processing

### 🔧 Technical Features
- **File Processing**: Client-side text extraction for PDF and DOCX files
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Performance**: Optimized for smooth user experience

## Setup Instructions

### 1. Prerequisites
- A web server (local or hosted)
- N8N instance with a webhook endpoint configured
- Modern web browser with JavaScript enabled

### 2. Installation

1. **Download the files** to your web server directory:
   ```
   index.html
   styles.css
   script.js
   README.md
   ```

2. **Configure the N8N webhook URL** in `script.js`:
   ```javascript
   const CONFIG = {
       // ... other config
       N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/motivation-letter', // ← Update this
       // ... other config
   };
   ```

3. **Set up your N8N workflow** to:
   - Receive POST requests with JSON payload containing `text` field
   - Process the text using AI services (e.g., OpenAI, Claude, etc.)
   - Return JSON response with `enhancedText` field

### 3. N8N Workflow Example

Here's a basic N8N workflow structure:

```
Webhook → AI Service → Response
```

**Webhook Node Configuration:**
- Method: POST
- Path: `/motivation-letter`
- Response Mode: "Respond to Webhook"

**AI Service Node** (e.g., OpenAI):
- Use the `{{ $json.text }}` from the webhook
- Configure your AI service with appropriate prompts

**Response Node:**
- Return JSON: `{ "enhancedText": "enhanced content here" }`

### 4. Testing

1. Open `index.html` in your web browser
2. Paste some sample text or upload a test file
3. Click "Analyze Letter" to test the webhook integration
4. Verify the enhanced text is displayed correctly

## File Structure

```
Motivation/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: ES6+, Fetch API, File API, Clipboard API

## Dependencies

The application uses the following CDN libraries:
- **PDF.js**: For PDF text extraction
- **Mammoth.js**: For DOCX text extraction  
- **Diff2Html**: For generating diff views

## Configuration Options

Edit the `CONFIG` object in `script.js` to customize:

```javascript
const CONFIG = {
    MAX_FILE_SIZE: 2 * 1024 * 1024,        // Max file size (2MB)
    SUPPORTED_FORMATS: ['.txt', '.md', '.pdf', '.docx'], // File types
    N8N_WEBHOOK_URL: '',                   // Your webhook URL
    TOAST_TIMEOUT: 5000                    // Toast display duration
};
```

## Usage

### For Users

1. **Input Method**: Choose between pasting text or uploading a file
2. **File Upload**: Drag & drop or click to browse (max 2MB)
3. **Analysis**: Click "Analyze Letter" to send for enhancement
4. **Review**: Compare original and enhanced versions side-by-side
5. **Export**: Copy text or download the enhanced version

### For Developers

The application exposes a global object for testing and debugging:

```javascript
// Access application state
console.log(window.MotivationLetterEnhancer.state);

// Trigger functions programmatically
window.MotivationLetterEnhancer.showToast('info', 'Test', 'Message');

// Switch tabs
window.MotivationLetterEnhancer.switchTab('upload');
```

## Customization

### Styling
- Modify CSS variables in `:root` for color schemes
- Adjust spacing, typography, and layout in `styles.css`
- Add custom themes or dark mode support

### Functionality
- Extend file format support in `extractTextFromFile()`
- Add new export formats in the download functions
- Implement additional AI services or processing options

## Troubleshooting

### Common Issues

1. **Webhook not working**: Check N8N URL and workflow configuration
2. **File upload fails**: Verify file size and format restrictions
3. **PDF/DOCX extraction fails**: Ensure browser supports required APIs
4. **Styling issues**: Check CSS file path and browser compatibility

### Debug Mode

Open browser console to see detailed error messages and application state.

## Security Considerations

- **Client-side processing**: All file processing happens in the browser
- **No data storage**: Text is not stored on the server
- **Webhook security**: Implement appropriate authentication for your N8N webhook
- **File validation**: Client-side file type and size validation

## Performance

- **Lazy loading**: Libraries loaded only when needed
- **Efficient processing**: File reading and text extraction optimized
- **Responsive design**: Smooth animations and transitions
- **Memory management**: Proper cleanup of file objects and URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify N8N workflow configuration
4. Test with different file types and sizes

---

**Note**: This application requires an active N8N instance with AI processing capabilities to function fully. The webhook endpoint must be properly configured to receive and process motivation letter text.
