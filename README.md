# Combined Audio Analysis - Frontend

A React application that provides a unified interface for both vocal syllable extraction and percussion analysis.

## Features

- **Single Upload**: Upload one audio file to get both analyses
- **Real-time Processing**: Track the progress of both vocal and percussion analysis
- **Tabbed Results**: View vocal and percussion results in separate tabs
- **Download Options**: Download syllable CSV and separated audio tracks
- **Beautiful UI**: Modern Material-UI design with smooth animations

## Tech Stack

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Framer Motion** - Animations
- **Vite** - Build tool
- **WaveSurfer.js** - Audio visualization
- **Recharts** - Data visualization

## Setup

### Prerequisites
```bash
node --version  # Should be 16+
npm --version
```

### Installation
```bash
cd frontend
npm install
```

### Configuration

Update `src/config.js` with your deployed backend URL:

```javascript
export const API_CONFIG = {
  COMBINED_API_URL: 'https://your-modal-url-here.modal.run',
  // ... other URLs
};
```

### Development

```bash
npm run dev
# Opens at http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output in ./build directory
```

## Deployment

### Deploy to Vercel

1. Push to GitHub repository
2. Import project to Vercel
3. Set environment variable:
   - `VITE_COMBINED_API_URL`: Your Modal backend URL
4. Deploy

### Alternative: Deploy Anywhere

```bash
npm run build
# Upload the ./build directory to your hosting service
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UploadSection.jsx       # File upload UI
│   │   ├── ProcessingSection.jsx   # Processing status
│   │   ├── CombinedResultsSection.jsx  # Results overview
│   │   ├── VocalResults.jsx        # Vocal analysis details
│   │   └── PercussionResults.jsx   # Percussion analysis details
│   ├── App.jsx                     # Main app component
│   ├── config.js                   # API configuration
│   └── index.jsx                   # Entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json                     # Vercel deployment config
```

## API Integration

The frontend communicates with the combined backend at `/api/analyze`:

```javascript
// Upload audio file
POST /api/analyze
Body: FormData with 'audio_file'

// Response
{
  "success": true,
  "vocal_analysis": { /* ... */ },
  "percussion_analysis": { /* ... */ },
  "summary": {
    "total_syllables": 1234,
    "drum_hits": 567
  }
}
```

## Features Breakdown

### Upload Section
- Drag-and-drop file upload
- File type validation
- File size display
- Clear instructions

### Processing Section
- Multi-step progress indicator
- Real-time status updates
- Estimated time remaining
- Cancel option

### Results Section
- Summary cards for both analyses
- Success/failure indicators
- Tabbed interface for detailed results
- Download buttons for CSV and audio tracks

### Vocal Results Tab
- Song identification info
- Syllable statistics
- Searchable syllable table
- Confidence scores

### Percussion Results Tab
- Drum hit statistics
- BPM detection
- Drum type breakdown
- Download separated tracks
- Detailed analysis JSON

## Customization

### Theme
Edit colors in `src/index.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
  },
});
```

### API Endpoints
Update `src/config.js` to point to different backends.

## Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled
- Check `vercel.json` headers configuration

### File Upload Fails
- Verify API_CONFIG.COMBINED_API_URL is correct
- Check browser console for errors
- Ensure backend is running

### Results Not Displaying
- Check browser console for API response
- Verify response format matches expected structure

## License

MIT License - See LICENSE file for details

