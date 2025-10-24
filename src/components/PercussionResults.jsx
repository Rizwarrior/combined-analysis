import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';
import MultiTrackPlayer from './MultiTrackPlayer';

export default function PercussionResults({ data }) {
  const { session_id, analysis, separation } = data;

  // The percussion API returns: total_drums, drums_by_type, timing_analysis
  const totalDrums = analysis?.total_drums || 0;
  const drumTypes = analysis?.drums_by_type || {};
  const timingAnalysis = analysis?.timing_analysis || {};

  const handleDownloadJSON = () => {
    const jsonData = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `percussion-analysis-${session_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTrack = (trackName) => {
    const url = `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${trackName}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      {/* Multi-Track Audio Player */}
      <Box sx={{ mb: 3 }}>
        <MultiTrackPlayer session_id={session_id} />
      </Box>

      {/* Download Individual Stems */}
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Download individual stems or the full analysis data below
        </Alert>
        <Grid container spacing={2}>
          {['vocals', 'drums', 'bass', 'other'].map((track) => (
            <Grid item xs={6} sm={3} key={track}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadTrack(track)}
                sx={{ borderRadius: 2, textTransform: 'capitalize' }}
              >
                {track}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Statistics */}
      <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Drum Analysis Statistics
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadJSON}
            sx={{ borderRadius: 2 }}
          >
            Download JSON
          </Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Drum Hits
            </Typography>
            <Typography variant="h5" color="secondary.main">
              {totalDrums}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Average BPM
            </Typography>
            <Typography variant="h5">
              {timingAnalysis.average_bpm ? timingAnalysis.average_bpm.toFixed(1) : 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Session ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {session_id?.substring(0, 8)}...
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Drum Types Breakdown */}
      {Object.keys(drumTypes).length > 0 && (
        <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Drum Types Detected
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(drumTypes).map(([type, count]) => (
              <Grid item xs={6} sm={4} md={3} key={type}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {type.toUpperCase()}
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {count}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}


      {/* Detailed Analysis Info */}
      {analysis.detailed_analysis && (
        <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(analysis.detailed_analysis, null, 2)}
          </Typography>
        </Box>
      )}

      {/* Session Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Session ID: {session_id}
        </Typography>
      </Box>
    </Box>
  );
}

