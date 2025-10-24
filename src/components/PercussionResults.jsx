import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  GraphicEq as GraphicEqIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';

export default function PercussionResults({ data }) {
  const { session_id, analysis, separation } = data;

  const statistics = analysis?.statistics || {};
  const drumTypes = analysis?.drum_types || {};

  const handleDownloadTrack = (trackName) => {
    const url = `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${trackName}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      {/* Statistics */}
      <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Drum Analysis Statistics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Drum Hits
            </Typography>
            <Typography variant="h5" color="secondary.main">
              {statistics.total_hits || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Average BPM
            </Typography>
            <Typography variant="h5">
              {statistics.average_bpm ? statistics.average_bpm.toFixed(1) : 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Processing Time
            </Typography>
            <Typography variant="h5">
              {analysis.processing_time ? `${analysis.processing_time.toFixed(1)}s` : 'N/A'}
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

      {/* Separated Tracks Download */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Download Separated Audio Tracks
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          The audio has been separated into individual tracks. Click below to download each track.
        </Alert>
        <Grid container spacing={2}>
          {['vocals', 'drums', 'bass', 'other'].map((track) => (
            <Grid item xs={12} sm={6} md={3} key={track}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GraphicEqIcon />}
                onClick={() => handleDownloadTrack(track)}
                sx={{ 
                  py: 2, 
                  borderRadius: 2,
                  textTransform: 'capitalize',
                }}
              >
                {track}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

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

