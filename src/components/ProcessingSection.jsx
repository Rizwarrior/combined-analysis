import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import API_CONFIG from '../config';

const STEPS = [
  {
    label: 'Uploading Audio',
    description: 'Sending your file to the server...',
  },
  {
    label: 'Vocal Analysis',
    description: 'Extracting syllable timestamps (30-60s)',
  },
  {
    label: 'Percussion Separation',
    description: 'Separating drums from the mix (30-120s)',
  },
  {
    label: 'Drum Analysis',
    description: 'Analyzing percussion patterns (2-15 minutes)',
  },
  {
    label: 'Complete',
    description: 'Processing finished!',
  },
];

export default function ProcessingSection({ processingData, onComplete, onReset }) {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    processAudio();
  }, []);

  const processAudio = async () => {
    try {
      const { file } = processingData;

      // Step 0: Uploading
      setActiveStep(0);

      const formData = new FormData();
      formData.append('audio_file', file);

      // Step 1-4: Processing
      setActiveStep(1);

      const response = await fetch(`${API_CONFIG.COMBINED_API_URL}/api/analyze`, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      // Step 5: Complete
      setActiveStep(4);
      setProgress(100);

      // Delay to show completion
      setTimeout(() => {
        onComplete(result);
      }, 1000);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
    }
  };

  // Simulate progress for visual feedback
  useEffect(() => {
    if (activeStep > 0 && activeStep < 4) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90);
        });
      }, 2000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [activeStep]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          action={
            <Button color="inherit" size="small" onClick={onReset}>
              Try Again
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Processing Failed
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CircularProgress size={80} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Processing Your Audio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This may take 2-15 minutes depending on song length...
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => {
                  if (index < activeStep) {
                    return <CheckCircleIcon color="success" />;
                  } else if (index === activeStep) {
                    return <CircularProgress size={24} />;
                  } else {
                    return <HourglassEmptyIcon color="disabled" />;
                  }
                }}
              >
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            {Math.round(progress)}% complete
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" onClick={onReset} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
}

