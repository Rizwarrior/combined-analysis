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
  Paper,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  GraphicEq as GraphicEqIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';

export default function PercussionResults({ data }) {
  const { session_id, analysis, separation } = data;

  const statistics = analysis?.statistics || {};
  const drumTypes = analysis?.drum_types || {};
  const [playingTrack, setPlayingTrack] = useState(null);
  const [audioElements] = useState({});

  const handleDownloadTrack = (trackName) => {
    const url = `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${trackName}`;
    window.open(url, '_blank');
  };

  const handlePlayPause = (trackName) => {
    if (!audioElements[trackName]) {
      const audio = new Audio(`${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${trackName}`);
      audioElements[trackName] = audio;
      
      audio.onended = () => {
        setPlayingTrack(null);
      };
    }

    const audio = audioElements[trackName];

    if (playingTrack === trackName) {
      audio.pause();
      setPlayingTrack(null);
    } else {
      // Pause other tracks
      Object.keys(audioElements).forEach(key => {
        if (key !== trackName && audioElements[key]) {
          audioElements[key].pause();
        }
      });
      
      audio.play();
      setPlayingTrack(trackName);
    }
  };

  const getTrackIcon = (trackName) => {
    const icons = {
      vocals: '🎤',
      drums: '🥁',
      bass: '🔊',
      other: '🎸'
    };
    return icons[trackName] || '🎵';
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

      {/* Separated Tracks - Audio Players */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Separated Audio Tracks
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Audio separated into 4 stems! Play them below or download.
        </Alert>
        <Grid container spacing={2}>
          {['vocals', 'drums', 'bass', 'other'].map((track) => (
            <Grid item xs={12} sm={6} key={track}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: playingTrack === track ? '2px solid' : '1px solid',
                  borderColor: playingTrack === track ? 'primary.main' : 'divider',
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handlePlayPause(track)}
                    sx={{ 
                      bgcolor: 'primary.light',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                  >
                    {playingTrack === track ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {getTrackIcon(track)} {track}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {playingTrack === track ? 'Playing...' : 'Click to play'}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadTrack(track)}
                    sx={{ borderRadius: 2 }}
                  >
                    Download
                  </Button>
                </Box>
              </Paper>
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

