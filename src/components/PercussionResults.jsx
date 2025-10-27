import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';
import './PercussionResults.css';

const PercussionResults = ({ analysis, session_id }) => {
  const [showTimestamps, setShowTimestamps] = useState(false);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState({
    vocals: 1,
    drums: 1,
    bass: 1,
    other: 1
  });
  const [mutedTracks, setMutedTracks] = useState({
    vocals: false,
    drums: false,
    bass: false,
    other: false
  });
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    vocals: true,
    drums: true,
    bass: true,
    other: true
  });

  const audioRefs = useRef({});
  const progressRef = useRef(null);

  const trackInfo = {
    vocals: { name: 'Vocals', color: '#e74c3c', icon: '🎤' },
    drums: { name: 'Drums', color: '#f39c12', icon: '🥁' },
    bass: { name: 'Bass', color: '#9b59b6', icon: '🎸' },
    other: { name: 'Other', color: '#2ecc71', icon: '🎹' }
  };

  const tracks = session_id ? {
    vocals: `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/vocals`,
    drums: `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/drums`,
    bass: `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/bass`,
    other: `${API_CONFIG.PERC_API_URL}/api/download/${session_id}/other`
  } : {};

  // Setup audio elements
  useEffect(() => {
    if (!session_id) return;

    const trackTypes = Object.keys(tracks);
    const primaryTrack = trackTypes[0];

    trackTypes.forEach(trackType => {
      const audio = audioRefs.current[trackType];
      if (audio) {
        const handleLoadedMetadata = () => {
          console.log(`${trackType} metadata loaded, duration: ${audio.duration}`);
          if (trackType === primaryTrack) {
            setDuration(audio.duration);
          }
        };

        const handleTimeUpdate = () => {
          if (trackType === primaryTrack && !isDragging) {
            setCurrentTime(audio.currentTime);
          }
        };

        const handleEnded = () => {
          if (trackType === primaryTrack) {
            setIsPlaying(false);
          }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.volume = volumes[trackType];

        return () => {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('ended', handleEnded);
          audio.pause();
        };
      }
    });
  }, [session_id]);

  const togglePlayPause = async () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2);

    if (newIsPlaying) {
      const primaryAudio = audioElements[0];
      if (primaryAudio) {
        const syncTime = primaryAudio.currentTime;
        audioElements.forEach(audio => {
          if (Math.abs(audio.currentTime - syncTime) > 0.1) {
            audio.currentTime = syncTime;
          }
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      audioElements.forEach(audio => {
        audio.play().catch(error => console.warn('Could not start playback:', error));
      });
    } else {
      audioElements.forEach(audio => audio.pause());
    }
  };

  const restartSong = () => {
    seekToTime(0);
  };

  const seekToTime = async (newTime) => {
    const audioElements = Object.values(audioRefs.current).filter(audio => audio && audio.readyState >= 2);
    const wasPlaying = isPlaying;

    setCurrentTime(newTime);

    if (wasPlaying) {
      audioElements.forEach(audio => audio.pause());
      setIsPlaying(false);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    audioElements.forEach(audio => {
      try {
        audio.currentTime = newTime;
      } catch (error) {
        console.warn('Could not set currentTime:', error);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    if (wasPlaying) {
      setIsPlaying(true);
      audioElements.forEach(audio => {
        audio.play().catch(error => console.warn('Could not resume playback:', error));
      });
    }
  };

  const handleProgressClick = (e) => {
    if (!isDragging && progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newTime = (clickX / rect.width) * duration;
      seekToTime(newTime);
    }
  };

  const handleProgressMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent) => {
      if (moveEvent.buttons === 1 && progressRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
        const newTime = (clickX / rect.width) * duration;
        setCurrentTime(newTime);
      }
    };

    const handleMouseUp = (upEvent) => {
      setIsDragging(false);
      if (progressRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(upEvent.clientX - rect.left, rect.width));
        const finalTime = (clickX / rect.width) * duration;
        setTimeout(() => seekToTime(finalTime), 10);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleVolumeChange = (trackType, volume) => {
    setVolumes(prev => ({ ...prev, [trackType]: volume }));
    const audio = audioRefs.current[trackType];
    if (audio) {
      audio.volume = mutedTracks[trackType] ? 0 : volume;
    }
  };

  const toggleMute = (trackType) => {
    const newMuted = !mutedTracks[trackType];
    setMutedTracks(prev => ({ ...prev, [trackType]: newMuted }));
    const audio = audioRefs.current[trackType];
    if (audio) {
      audio.volume = newMuted ? 0 : volumes[trackType];
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time) || isNaN(time)) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const downloadTrack = async (trackType) => {
    try {
      const response = await fetch(tracks[trackType]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${trackType}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download ${trackType}:`, error);
      window.open(tracks[trackType], '_blank');
    }
  };

  const downloadKickSnareJSON = () => {
    const data = {
      kicks: analysis.kicks || [],
      snares: analysis.snares || [],
      metadata: {
        total_kicks: (analysis.kicks || []).length,
        total_snares: (analysis.snares || []).length,
        bpm: analysis.timing_analysis?.average_bpm || 0,
        exported_at: new Date().toISOString()
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kick-snare-timestamps.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllDrumsJSON = () => {
    const data = {
      drums_by_type: analysis.drums_by_type || {},
      all_drums: analysis.all_drums || [],
      metadata: {
        total_drums: analysis.total_drums || 0,
        bpm: analysis.timing_analysis?.average_bpm || 0,
        timing_analysis: analysis.timing_analysis || {},
        exported_at: new Date().toISOString()
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-drums-timestamps.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!analysis) return null;

  const totalDrums = analysis.total_drums || 0;
  const kickCount = (analysis.kicks || []).length;
  const snareCount = (analysis.snares || []).length;
  const avgBpm = Math.round(analysis.timing_analysis?.average_bpm || 0);
  const drumsByType = analysis.drums_by_type || {};

  return (
    <Box className="percussion-results">
      {/* Audio Player Section */}
      {session_id && (
        <Paper elevation={3} className="player-container">
          <Box className="player-header">
            <Typography variant="h5" className="player-title">
              Separated Tracks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your music has been successfully separated into individual stems
            </Typography>
          </Box>

          {/* Main Playback Controls */}
          <Box className="main-controls">
            <Box className="playback-controls">
              <IconButton 
                onClick={togglePlayPause}
                className="play-button"
                disabled={Object.values(loadingStates).every(l => l)}
                size="large"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton onClick={restartSong} className="restart-button" size="large">
                <RefreshIcon />
              </IconButton>
            </Box>

            <Box className="progress-container">
              <Typography className="time-display">{formatTime(currentTime)}</Typography>
              <Box
                ref={progressRef}
                className="progress-bar"
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
              >
                <Box
                  className="progress-fill"
                  sx={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
                <Box
                  className="progress-handle"
                  sx={{
                    left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                    opacity: isDragging ? 1 : 0
                  }}
                />
              </Box>
              <Typography className="time-display">{formatTime(duration)}</Typography>
            </Box>
          </Box>

          {/* Individual Track Controls */}
          <Grid container spacing={2} className="tracks-grid">
            {Object.entries(tracks).map(([trackType, trackUrl]) => (
              <Grid item xs={12} sm={6} md={3} key={trackType}>
                <Paper className={`track-card ${trackType === 'drums' ? 'analyzed' : ''}`} elevation={1}>
                  <audio
                    ref={el => audioRefs.current[trackType] = el}
                    src={trackUrl}
                    preload="auto"
                    crossOrigin="anonymous"
                    onCanPlay={() => {
                      console.log(`${trackType} can start playing`);
                      setLoadingStates(prev => ({ ...prev, [trackType]: false }));
                    }}
                    onLoadStart={() => {
                      console.log(`${trackType} started loading`);
                      setLoadingStates(prev => ({ ...prev, [trackType]: true }));
                    }}
                    onError={() => {
                      console.error(`${trackType} failed to load`);
                      setLoadingStates(prev => ({ ...prev, [trackType]: false }));
                    }}
                  />

                  <Box className="track-header">
                    <Box className="track-info">
                      <Typography component="span" className="track-icon">
                        {trackInfo[trackType].icon}
                      </Typography>
                      <Typography variant="subtitle1" className="track-name" style={{ color: trackInfo[trackType].color }}>
                        {trackInfo[trackType].name}
                        {loadingStates[trackType] && (
                          <Chip label="Loading..." size="small" className="loading-badge" />
                        )}
                        {trackType === 'drums' && (
                          <Chip label="✓ Analyzed" size="small" className="analyzed-badge" />
                        )}
                      </Typography>
                    </Box>

                    <Box className="track-actions">
                      <IconButton
                        onClick={() => toggleMute(trackType)}
                        className={`mute-button ${mutedTracks[trackType] ? 'muted' : ''}`}
                        size="small"
                      >
                        {mutedTracks[trackType] ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        onClick={() => downloadTrack(trackType)}
                        className="download-button"
                        size="small"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box className="volume-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volumes[trackType]}
                      onChange={(e) => handleVolumeChange(trackType, parseFloat(e.target.value))}
                      className="volume-slider"
                      style={{
                        background: `linear-gradient(to right, ${trackInfo[trackType].color} 0%, ${trackInfo[trackType].color} ${volumes[trackType] * 100}%, #ddd ${volumes[trackType] * 100}%, #ddd 100%)`
                      }}
                    />
                    <Typography variant="caption" className="volume-label">
                      {Math.round(volumes[trackType] * 100)}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box className="download-all" sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => Object.keys(tracks).forEach(trackType => downloadTrack(trackType))}
              className="download-all-button"
            >
              Download All Tracks
            </Button>
          </Box>
        </Paper>
      )}

      {/* Analysis Results Section */}
      <Paper elevation={3} className="results-container">
        <Typography variant="h5" className="results-title">
          Analysis Results
        </Typography>

        {/* Visualization */}
        {analysis.visualization && (
          <Box className="visualization-section">
            <img
              src={`data:image/png;base64,${analysis.visualization}`}
              alt="Drum Analysis Visualization"
              className="visualization-image"
            />
          </Box>
        )}

        {/* Statistics */}
        <Grid container spacing={2} className="stats-grid">
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card kick" elevation={0}>
              <Typography variant="h3" className="stat-number">{kickCount}</Typography>
              <Typography variant="body2" className="stat-label">KICKS</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card snare" elevation={0}>
              <Typography variant="h3" className="stat-number">{snareCount}</Typography>
              <Typography variant="body2" className="stat-label">SNARES</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card total" elevation={0}>
              <Typography variant="h3" className="stat-number">{totalDrums}</Typography>
              <Typography variant="body2" className="stat-label">TOTAL DRUMS</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper className="stat-card bpm" elevation={0}>
              <Typography variant="h3" className="stat-number">{avgBpm}</Typography>
              <Typography variant="body2" className="stat-label">BPM</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Drum Types */}
        {Object.keys(drumsByType).length > 2 && (
          <Box className="drum-types-section">
            <Typography variant="h6" className="section-title">
              Drum Types Detected
            </Typography>
            <Grid container spacing={1} className="drum-types-grid">
              {Object.entries(drumsByType).map(([type, times]) => (
                <Grid item xs={4} sm={3} md={2} key={type}>
                  <Paper className={`drum-type-card ${type}`} elevation={0}>
                    <Typography variant="h5" className="drum-type-count">{times.length}</Typography>
                    <Typography variant="caption" className="drum-type-name">{type}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Export Buttons */}
        <Box className="download-section">
          <Typography variant="h6" className="section-title">
            Export Timestamps
          </Typography>
          <Box className="download-buttons">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadKickSnareJSON}
              className="download-button kick-snare"
            >
              Download Kick & Snare JSON
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadAllDrumsJSON}
              className="download-button all-drums"
            >
              Download All Drums JSON
            </Button>
          </Box>
        </Box>

        {/* BPM Info */}
        {avgBpm > 0 && (
          <Box className="bpm-info">
            <Typography variant="h6" className="section-title">
              BPM Analysis
            </Typography>
            <Typography variant="body1">
              <strong>Detected BPM:</strong> {avgBpm}
            </Typography>
          </Box>
        )}

        {/* Controls */}
        <Box className="controls">
          <Button
            variant="contained"
            onClick={() => setShowTimestamps(!showTimestamps)}
            className="toggle-button"
          >
            {showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
          </Button>
        </Box>

        {/* Timestamps */}
        {showTimestamps && (
          <Box className="timestamps-section">
            <Typography variant="h6" className="section-title">
              All Drum Timestamps
            </Typography>
            <Grid container spacing={2} className="timestamp-grid-all">
              {Object.entries(drumsByType).map(([drumType, times]) => (
                <Grid item xs={12} sm={6} md={4} key={drumType}>
                  <Box className="timestamp-column">
                    <Typography variant="subtitle1" className={`drum-type-header ${drumType}`}>
                      {drumType.charAt(0).toUpperCase() + drumType.slice(1)} ({times.length})
                    </Typography>
                    <Box className="timestamp-list">
                      {times.map((time, index) => (
                        <Chip
                          key={index}
                          label={formatTimestamp(time)}
                          className={`timestamp ${drumType}`}
                          size="small"
                        />
                      ))}
                      {times.length === 0 && (
                        <Typography variant="body2" className="no-hits">
                          No {drumType}s detected
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PercussionResults;
