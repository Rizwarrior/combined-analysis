// API Configuration
export const API_CONFIG = {
  // Combined backend URL
  COMBINED_API_URL: import.meta.env.VITE_COMBINED_API_URL || 'https://therealriz946--combined-audio-analysis-v1-fastapi-app.modal.run',
  
  // Direct access to individual services (for download links, etc.)
  VOCAL_API_URL: 'https://therealriz946--vocal-syllable-extractor-main-v2-fastapi-app.modal.run',
  PERC_API_URL: 'https://therealriz946--perc-analysis-backend-v3-fastapi-app.modal.run',
};

export default API_CONFIG;

