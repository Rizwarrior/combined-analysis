import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  GraphicEq as GraphicEqIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';

const MultiTrackPlayer = ({ session_id }) => {
  const audioRefs = useRef({
    vocals: null,
    drums: null,
    bass: null,
    other: null
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState({
    vocals: 1.0,
    drums: 1.0,
    bass: 1.0,
    other: 1.0
  });
  const [muted, setMuted] = useState({
    vocals: false,
    drums: false,
    bass: false,
    other: false
  });
  const [masterVolume, setMasterVolume] = useState(1.0);

  const tracks = [
    { name: 'vocals', label: 'Vocals', icon: '🎤', color: '#4CAF50' },
    { name: 'drums', label: 'Drums', icon: '🥁', color: '#FF5722' },
    { name: 'bass', label: 'Bass', icon: '🔊', color: '#2196F3' },
    { name: 'other', label: 'Other', icon: '🎸', color: '#9C27B0' },
  ];

  useEffect(() => {
    if (!session_id) return;

    // Initialize audio elements
    tracks.forEach(track => {
      const audio = new Audio();
      audio.src = `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${track.name}`;
      audio.volume = volumes[track.name] * masterVolume;
      audio.muted = muted[track.name];
      audioRefs.current[track.name] = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        if (track.name === 'vocals') {
          setDuration(audio.duration);
        }
      });

      audio.addEventListener('timeupdate', () => {
        if (track.name === 'vocals') {
          setCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener('ended', () => {
        if (track.name === 'vocals') {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      });
    });

    // Cleanup
    return () => {
      tracks.forEach(track => {
        const audio = audioRefs.current[track.name];
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, [session_id]);

  // Update volumes when they change
  useEffect(() => {
    tracks.forEach(track => {
      const audio = audioRefs.current[track.name];
      if (audio) {
        audio.volume = volumes[track.name] * masterVolume;
        audio.muted = muted[track.name];
      }
    });
  }, [volumes, muted, masterVolume]);

  const togglePlayPause = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    tracks.forEach(track => {
      const audio = audioRefs.current[track.name];
      if (audio) {
        if (newIsPlaying) {
          audio.play().catch(err => console.error(`Error playing ${track.name}:`, err));
        } else {
          audio.pause();
        }
      }
    });
  };

  const handleSeek = (event, newValue) => {
    const newTime = (newValue / 100) * duration;
    setCurrentTime(newTime);
    
    tracks.forEach(track => {
      const audio = audioRefs.current[track.name];
      if (audio) {
        audio.currentTime = newTime;
      }
    });
  };

  const handleVolumeChange = (trackName, newValue) => {
    const newVolume = newValue / 100;
    setVolumes(prev => ({ ...prev, [trackName]: newVolume }));
  };

  const handleMasterVolumeChange = (event, newValue) => {
    setMasterVolume(newValue / 100);
  };

  const handleMuteToggle = (trackName) => {
    setMuted(prev => ({ ...prev, [trackName]: !prev[trackName] }));
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session_id) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Upload an audio file to get percussion analysis and separated stems.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GraphicEqIcon /> Multi-Track Audio Player
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Play all 4 separated stems simultaneously with independent volume control
      </Typography>

      {/* Main Playback Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconButton 
            onClick={togglePlayPause} 
            color="primary" 
            size="large"
            sx={{ 
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <Typography variant="body2" sx={{ minWidth: 50 }}>
            {formatTime(currentTime)}
          </Typography>

          <Slider
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            sx={{ flexGrow: 1 }}
            size="small"
          />

          <Typography variant="body2" sx={{ minWidth: 50 }}>
            {formatTime(duration)}
          </Typography>
        </Stack>

        {/* Master Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
          <VolumeUpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ minWidth: 80, fontWeight: 600 }}>
            Master Volume
          </Typography>
          <Slider
            value={masterVolume * 100}
            onChange={handleMasterVolumeChange}
            sx={{ 
              flexGrow: 1,
              '& .MuiSlider-thumb': {
                bgcolor: 'primary.main',
              },
              '& .MuiSlider-track': {
                bgcolor: 'primary.main',
              },
            }}
            size="small"
          />
          <Typography 
            variant="caption" 
            sx={{ 
              minWidth: 35,
              color: 'text.secondary',
              fontWeight: 600
            }}
          >
            {Math.round(masterVolume * 100)}%
          </Typography>
        </Box>
      </Box>

      {/* Individual Track Controls */}
      <Grid container spacing={2}>
        {tracks.map(track => (
          <Grid item xs={12} sm={6} key={track.name}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                borderLeft: `5px solid ${track.color}`,
                bgcolor: muted[track.name] ? 'action.hover' : 'background.paper',
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {track.icon} {track.label}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleMuteToggle(track.name)}
                  color={muted[track.name] ? 'error' : 'default'}
                  sx={{ 
                    bgcolor: muted[track.name] ? 'error.light' : 'action.hover',
                    '&:hover': { 
                      bgcolor: muted[track.name] ? 'error.main' : 'action.selected',
                      color: muted[track.name] ? 'white' : 'inherit'
                    }
                  }}
                >
                  {muted[track.name] ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUpIcon 
                  fontSize="small" 
                  sx={{ 
                    color: muted[track.name] ? 'text.disabled' : track.color 
                  }} 
                />
                <Slider
                  value={volumes[track.name] * 100}
                  onChange={(e, newValue) => handleVolumeChange(track.name, newValue)}
                  min={0}
                  max={100}
                  step={1}
                  size="small"
                  sx={{ flexGrow: 1, color: track.color }}
                  disabled={muted[track.name]}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    minWidth: 35, 
                    color: muted[track.name] ? 'text.disabled' : 'text.secondary',
                    fontWeight: 600
                  }}
                >
                  {muted[track.name] ? 'Muted' : `${Math.round(volumes[track.name] * 100)}%`}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default MultiTrackPlayer;
