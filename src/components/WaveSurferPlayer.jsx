import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';

const WaveSurferPlayer = ({ audioFile, syllables = [] }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentSyllable, setCurrentSyllable] = useState(null);

  useEffect(() => {
    if (waveformRef.current && audioFile) {
      try {
        // Initialize WaveSurfer
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: '#3f51b5',
          progressColor: '#1976d2',
          cursorColor: '#ff5722',
          barWidth: 2,
          barRadius: 3,
          responsive: true,
          height: 80,
          normalize: true,
          backend: 'WebAudio',
          mediaControls: false,
        });

        // Load audio file
        const audioUrl = URL.createObjectURL(audioFile);
        wavesurfer.current.load(audioUrl);

        // Event listeners
        wavesurfer.current.on('ready', () => {
          setDuration(wavesurfer.current.getDuration());
          wavesurfer.current.setVolume(volume);
        });

        wavesurfer.current.on('audioprocess', () => {
          const time = wavesurfer.current.getCurrentTime();
          setCurrentTime(time);
          updateCurrentSyllable(time);
        });

        wavesurfer.current.on('seek', () => {
          const time = wavesurfer.current.getCurrentTime();
          setCurrentTime(time);
          updateCurrentSyllable(time);
        });

        wavesurfer.current.on('play', () => setIsPlaying(true));
        wavesurfer.current.on('pause', () => setIsPlaying(false));

        return () => {
          if (wavesurfer.current) {
            wavesurfer.current.pause();
            wavesurfer.current.destroy();
          }
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error('Error initializing WaveSurfer:', error);
      }
    }
  }, [audioFile]);

  // Separate effect for syllable updates to avoid stale closures
  useEffect(() => {
    if (wavesurfer.current && isPlaying) {
      const interval = setInterval(() => {
        if (wavesurfer.current && wavesurfer.current.isPlaying()) {
          const time = wavesurfer.current.getCurrentTime();
          updateCurrentSyllable(time);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, syllables]);

  const updateCurrentSyllable = (time) => {
    const current = syllables.find(
      (syl) => time >= syl.start && time <= syl.end
    );
    setCurrentSyllable(current);
  };

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleSeek = (event, newValue) => {
    if (wavesurfer.current) {
      const seekTime = (newValue / 100) * duration;
      wavesurfer.current.seekTo(seekTime / duration);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue / 100);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newValue / 100);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioFile) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Audio Player & Waveform
      </Typography>

      {/* Waveform */}
      <Box
        ref={waveformRef}
        sx={{
          width: '100%',
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
        }}
      />

      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
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

        <VolumeIcon />
        <Slider
          value={volume * 100}
          onChange={handleVolumeChange}
          sx={{ width: 100 }}
          size="small"
        />
      </Stack>

      {/* Current Syllable Display */}
      <Box sx={{ minHeight: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Syllable:
        </Typography>
        {currentSyllable ? (
          <Chip
            label={`"${currentSyllable.syllable}" (${currentSyllable.word}) - ${currentSyllable.start.toFixed(2)}s`}
            color="primary"
            variant="outlined"
          />
        ) : (
          <Chip
            label="No syllable detected"
            color="default"
            variant="outlined"
            sx={{ opacity: 0.5 }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default WaveSurferPlayer;

