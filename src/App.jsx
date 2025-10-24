import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Zoom,
  useScrollTrigger,
  Tabs,
  Tab,
} from '@mui/material';
import {
  GraphicEq as GraphicEqIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  GitHub as GitHubIcon,
  MusicNote as MusicNoteIcon,
  Drums as DrumsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import UploadSection from './components/UploadSection';
import ProcessingSection from './components/ProcessingSection';
import CombinedResultsSection from './components/CombinedResultsSection';

function ScrollTop({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

function App() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [processingData, setProcessingData] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileUpload = (file) => {
    setCurrentStep('processing');
    setProcessingData({ file });
  };

  const handleProcessingComplete = (results) => {
    setResults(results);
    setCurrentStep('results');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setProcessingData(null);
    setResults(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
          >
            <GraphicEqIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Combined Audio Analysis
            </Typography>
          </motion.div>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <MusicNoteIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Vocals
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <DrumsIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Percussion
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Complete Audio Analysis
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto', fontWeight: 400 }}
            >
              Get vocal syllable timestamps AND percussion analysis in one go
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Box>
                <MusicNoteIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Syllable Extraction
                </Typography>
              </Box>
              <Box>
                <DrumsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Drum Analysis
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Content Sections */}
        {currentStep === 'upload' && (
          <UploadSection onFileUpload={handleFileUpload} />
        )}

        {currentStep === 'processing' && (
          <ProcessingSection
            processingData={processingData}
            onComplete={handleProcessingComplete}
            onReset={handleReset}
          />
        )}

        {currentStep === 'results' && (
          <CombinedResultsSection
            results={results}
            onReset={handleReset}
            audioFile={processingData?.file}
          />
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 8,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            © 2024 Combined Audio Analysis. Powered by WhisperX, Demucs, and Google Magenta.
          </Typography>
        </Container>
      </Box>

      {/* Scroll to Top */}
      <ScrollTop>
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </Box>
  );
}

export default App;

