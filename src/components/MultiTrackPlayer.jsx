import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
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

  const tracks = [
    { name: 'vocals', label: 'Vocals', icon: '🎤', color: '#4CAF50' },
    { name: 'drums', label: 'Drums', icon: '🥁', color: '#FF5722' },
    { name: 'bass', label: 'Bass', icon: '🔊', color: '#2196F3' },
    { name: 'other', label: 'Other', icon: '🎸', color: '#9C27B0' }
  ];

  useEffect(() => {
    // Initialize audio elements
    tracks.forEach(track => {
      const audio = new Audio(`${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${track.name}`);
      audio.preload = 'metadata';
      audioRefs.current[track.name] = audio;

      // Set initial volume
      audio.volume = volumes[track.name];

      // Update duration when metadata is loaded
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.max(duration, audio.duration));
      });

      // Update current time
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      // Handle playback end
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    });

    return () => {
      // Cleanup audio elements
      tracks.forEach(track => {
        if (audioRefs.current[track.name]) {
          audioRefs.current[track.name].pause();
          audioRefs.current[track.name] = null;
        }
      });
    };
  }, [session_id]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause all tracks
      tracks.forEach(track => {
        if (audioRefs.current[track.name]) {
          audioRefs.current[track.name].pause();
        }
      });
      setIsPlaying(false);
    } else {
      // Play all tracks
      tracks.forEach(track => {
        if (audioRefs.current[track.name]) {
          audioRefs.current[track.name].play();
        }
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (event, newValue) => {
    const seekTime = (newValue / 100) * duration;
    tracks.forEach(track => {
      if (audioRefs.current[track.name]) {
        audioRefs.current[track.name].currentTime = seekTime;
      }
    });
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (trackName, newValue) => {
    const newVolume = newValue / 100;
    setVolumes(prev => ({ ...prev, [trackName]: newVolume }));
    if (audioRefs.current[trackName]) {
      audioRefs.current[trackName].volume = newVolume;
    }
  };

  const handleMuteToggle = (trackName) => {
    const newMutedState = !muted[trackName];
    setMuted(prev => ({ ...prev, [trackName]: newMutedState }));
    if (audioRefs.current[trackName]) {
      audioRefs.current[trackName].muted = newMutedState;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Multi-Track Audio Player
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Play all 4 separated stems simultaneously with independent volume control
      </Typography>

      {/* Main Playback Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton 
            onClick={handlePlayPause} 
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
      </Box>

      {/* Individual Track Controls */}
      <Grid container spacing={2}>
        {tracks.map(track => (
          <Grid item xs={12} sm={6} key={track.name}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                borderLeft: '4px solid',
                borderLeftColor: track.color,
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
                    color: muted[track.name] ? 'text.disabled' : 'text.secondary' 
                  }} 
                />
                <Slider
                  value={volumes[track.name] * 100}
                  onChange={(e, val) => handleVolumeChange(track.name, val)}
                  disabled={muted[track.name]}
                  sx={{ 
                    flexGrow: 1,
                    '& .MuiSlider-thumb': {
                      bgcolor: track.color,
                    },
                    '& .MuiSlider-track': {
                      bgcolor: track.color,
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.3,
                    }
                  }}
                  size="small"
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    minWidth: 35,
                    color: muted[track.name] ? 'text.disabled' : 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {muted[track.name] ? 'MUTE' : `${Math.round(volumes[track.name] * 100)}%`}
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

