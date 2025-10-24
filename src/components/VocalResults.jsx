import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function VocalResults({ data, audioFile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSyllables, setFilteredSyllables] = useState(data.syllables || []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSyllables(data.syllables || []);
    } else {
      const filtered = (data.syllables || []).filter(
        syl => 
          syl.syllable.toLowerCase().includes(searchTerm.toLowerCase()) ||
          syl.word.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSyllables(filtered);
    }
  }, [searchTerm, data.syllables]);

  return (
    <Box>
      {/* Song Info */}
      {data.song_info && data.song_info.identified && (
        <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Song Information
          </Typography>
          <Typography variant="body1">
            <strong>Title:</strong> {data.song_info.title}
          </Typography>
          <Typography variant="body1">
            <strong>Artist:</strong> {data.song_info.artist}
          </Typography>
        </Box>
      )}

      {/* Statistics */}
      <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Statistics
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Syllables
            </Typography>
            <Typography variant="h5" color="primary.main">
              {data.processing.total_syllables}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Confidence
            </Typography>
            <Typography variant="h5" color="success.main">
              {(data.processing.confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Processing Time
            </Typography>
            <Typography variant="h5">
              {data.processing.processing_time}s
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Song Duration
            </Typography>
            <Typography variant="h5">
              {data.timing.song_duration.toFixed(1)}s
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search syllables or words..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Syllables Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 500, borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Syllable</strong></TableCell>
              <TableCell><strong>Word</strong></TableCell>
              <TableCell align="right"><strong>Start (s)</strong></TableCell>
              <TableCell align="right"><strong>End (s)</strong></TableCell>
              <TableCell align="right"><strong>Duration (s)</strong></TableCell>
              <TableCell align="center"><strong>Confidence</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSyllables.map((syl, index) => (
              <TableRow
                key={index}
                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
              >
                <TableCell>
                  <Chip label={syl.syllable} size="small" color="primary" />
                </TableCell>
                <TableCell>{syl.word}</TableCell>
                <TableCell align="right">{syl.start_time.toFixed(3)}</TableCell>
                <TableCell align="right">{syl.end_time.toFixed(3)}</TableCell>
                <TableCell align="right">{syl.duration.toFixed(3)}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${(syl.confidence * 100).toFixed(0)}%`}
                    size="small"
                    color={syl.confidence > 0.8 ? 'success' : syl.confidence > 0.5 ? 'warning' : 'error'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredSyllables.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No syllables match your search
        </Typography>
      )}
    </Box>
  );
}

