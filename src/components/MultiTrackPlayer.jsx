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
  Repeat as RepeatIcon,
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
  const [isDragging, setIsDragging] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [loadingStates, setLoadingStates] = useState({
    vocals: true,
    drums: true,
    bass: true,
    other: true
  });

  const tracks = [
    { name: 'vocals', label: 'Vocals', icon: '🎤', color: '#4CAF50' },
    { name: 'drums', label: 'Drums', icon: '🥁', color: '#FF5722' },
    { name: 'bass', label: 'Bass', icon: '🔊', color: '#2196F3' },
    { name: 'other', label: 'Other', icon: '🎸', color: '#9C27B0' }
  ];

  const primaryTrack = 'vocals'; // Use vocals as primary track for sync

  useEffect(() => {
    let timeUpdateThrottle = null;

    const setupAudio = () => {
      tracks.forEach(track => {
        const audio = audioRefs.current[track.name];
        if (audio) {
          const handleLoadedMetadata = () => {
            if (track.name === primaryTrack) {
              setDuration(audio.duration);
            }
          };

          const handleTimeUpdate = () => {
            // Only update time from primary track and throttle updates
            if (track.name === primaryTrack && !isDragging) {
              if (timeUpdateThrottle) {
                clearTimeout(timeUpdateThrottle);
              }

              timeUpdateThrottle = setTimeout(() => {
                const currentAudio = audioRefs.current[track.name];
                if (currentAudio && !isNaN(currentAudio.currentTime) && !isDragging) {
                  setCurrentTime(currentAudio.currentTime);
                }
              }, 100);
            }
          };

          const handleEnded = () => {
            if (track.name === primaryTrack) {
              setIsPlaying(false);
            }
          };

          audio.addEventListener('loadedmetadata', handleLoadedMetadata);
          audio.addEventListener('timeupdate', handleTimeUpdate);
          audio.addEventListener('ended', handleEnded);

          // Set initial volume with master volume applied
          audio.volume = volumes[track.name] * masterVolume;

          // If metadata already loaded
          if (audio.duration && !isNaN(audio.duration) && track.name === primaryTrack) {
            setDuration(audio.duration);
          }
        }
      });
    };

    const timeoutId = setTimeout(setupAudio, 100);

    return () => {
      clearTimeout(timeoutId);
      if (timeUpdateThrottle) {
        clearTimeout(timeUpdateThrottle);
      }

      // Cleanup: pause and remove all audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [session_id]); // Only re-setup when session_id changes

  const togglePlayPause = async () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2);

    if (newIsPlaying) {
      // Synchronize all tracks to primary track time
      const primaryAudio = audioRefs.current[primaryTrack];
      if (primaryAudio) {
        const syncTime = primaryAudio.currentTime;

        // Set all tracks to the same time
        audioElements.forEach(audio => {
          try {
            if (Math.abs(audio.currentTime - syncTime) > 0.1) {
              audio.currentTime = syncTime;
            }
          } catch (error) {
            console.warn('Could not sync audio time:', error);
          }
        });

        // Wait for sync
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Start all tracks simultaneously
      const playPromises = audioElements.map(audio => {
        return audio.play().catch(error => {
          console.warn('Could not start playback:', error);
          return null;
        });
      });

      try {
        await Promise.all(playPromises);
      } catch (error) {
        console.warn('Some tracks failed to start:', error);
      }
    } else {
      // Pause all tracks
      audioElements.forEach(audio => {
        audio.pause();
      });
    }
  };

  const restartSong = () => {
    seekToTime(0);
  };

  const seekToTime = async (newTime) => {
    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2);
    const wasPlaying = isPlaying;

    // Update displayed time immediately
    setCurrentTime(newTime);

    // Pause if playing
    if (wasPlaying) {
      audioElements.forEach(audio => audio.pause());
      setIsPlaying(false);
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    // Seek all tracks
    audioElements.forEach(audio => {
      try {
        audio.currentTime = newTime;
      } catch (error) {
        console.warn('Could not set currentTime:', error);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Resume if was playing
    if (wasPlaying) {
      setIsPlaying(true);
      const playPromises = audioElements.map(audio => audio.play().catch(() => null));
      Promise.all(playPromises).catch(() => {
        audioElements.forEach(audio => audio.play().catch(console.error));
      });
    }
  };

  const handleSeek = (event, newValue) => {
    if (!isDragging) {
      const newTime = (newValue / 100) * duration;
      seekToTime(newTime);
    }
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekEnd = (event, newValue) => {
    setIsDragging(false);
    const newTime = (newValue / 100) * duration;
    setTimeout(() => {
      seekToTime(newTime);
    }, 10);
  };

  const handleSeekChange = (event, newValue) => {
    // Update UI during drag
    const newTime = (newValue / 100) * duration;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (trackName, newValue) => {
    const newVolume = newValue / 100;
    setVolumes(prev => ({ ...prev, [trackName]: newVolume }));
    if (audioRefs.current[trackName]) {
      audioRefs.current[trackName].volume = newVolume * masterVolume;
    }
  };

  const handleMasterVolumeChange = (event, newValue) => {
    const newMasterVolume = newValue / 100;
    setMasterVolume(newMasterVolume);
    
    // Update all track volumes proportionally (respecting mute state)
    tracks.forEach(track => {
      const audio = audioRefs.current[track.name];
      if (audio) {
        audio.volume = volumes[track.name] * newMasterVolume;
      }
    });
  };

  const handleMuteToggle = (trackName) => {
    const newMutedState = !muted[trackName];
    setMuted(prev => ({ ...prev, [trackName]: newMutedState }));
    if (audioRefs.current[trackName]) {
      audioRefs.current[trackName].muted = newMutedState;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconButton 
            onClick={togglePlayPause} 
            color="primary" 
            size="large"
            disabled={Object.values(loadingStates).some(loading => loading)}
            sx={{ 
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
              '&:disabled': { bgcolor: 'action.disabledBackground' }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <IconButton
            onClick={restartSong}
            color="default"
            size="medium"
            title="Restart"
          >
            <RepeatIcon />
          </IconButton>

          <Typography variant="body2" sx={{ minWidth: 50 }}>
            {formatTime(currentTime)}
          </Typography>

          <Slider
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeekChange}
            onChangeCommitted={handleSeekEnd}
            onMouseDown={handleSeekStart}
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

      {/* Audio elements (hidden) */}
      {tracks.map(track => (
        <audio
          key={track.name}
          ref={el => audioRefs.current[track.name] = el}
          src={`${API_CONFIG.PERC_API_URL}/api/download/${session_id}/${track.name}`}
          preload="auto"
          onLoadStart={() => {
            console.log(`${track.name} started loading`);
            setLoadingStates(prev => ({ ...prev, [track.name]: true }));
          }}
          onCanPlay={() => {
            console.log(`${track.name} can start playing`);
            setLoadingStates(prev => ({ ...prev, [track.name]: false }));
          }}
          onCanPlayThrough={() => {
            console.log(`${track.name} fully loaded`);
          }}
          onProgress={(e) => {
            const audio = e.target;
            if (audio.buffered.length > 0) {
              const buffered = audio.buffered.end(0) / audio.duration * 100;
              console.log(`${track.name} buffered: ${buffered.toFixed(1)}%`);
            }
          }}
          onError={(e) => {
            console.error(`${track.name} failed to load`, e);
            setLoadingStates(prev => ({ ...prev, [track.name]: false }));
          }}
        />
      ))}

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {track.icon} {track.label}
                  </Typography>
                  {loadingStates[track.name] && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: 'warning.light',
                        color: 'warning.dark',
                        borderRadius: 1,
                        fontWeight: 600,
                        fontSize: '0.65rem'
                      }}
                    >
                      ⏳ Loading...
                    </Typography>
                  )}
                  {!loadingStates[track.name] && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        borderRadius: 1,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        animation: 'fadeOut 2s forwards',
                        '@keyframes fadeOut': {
                          '0%': { opacity: 1 },
                          '80%': { opacity: 1 },
                          '100%': { opacity: 0, display: 'none' }
                        }
                      }}
                    >
                      ✓ Ready
                    </Typography>
                  )}
                </Box>
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
