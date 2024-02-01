// AudioPlayer.js
// backgroundImage="url('https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?cs=srgb&dl=pexels-daniel-reche-3721941.jpg&fm=jpg')" // Replace with your image path
import React, { useState, useEffect } from 'react';
import {
  Input,
  Box,
  Text,
  Button,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
const AudioPlayer = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audio] = useState(new window.Audio()); // Use window.Audio to avoid conflicts
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load playlist from localStorage on component mount
    const storedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    const lastPlayingTrackIndex = parseInt(localStorage.getItem('lastPlayingTrackIndex'), 10) || 0;
    const lastPlaybackPosition = parseFloat(localStorage.getItem('lastPlaybackPosition')) || 0;

    if (storedPlaylist.length > 0) {
      setPlaylist(storedPlaylist);
      setCurrentTrackIndex(lastPlayingTrackIndex);

      // Set the audio source and load metadata
      audio.src = storedPlaylist[lastPlayingTrackIndex].url;
      audio.load();

      // Set the playback position
      audio.currentTime = lastPlaybackPosition;

      // Start playing if it was playing before
      if (localStorage.getItem('isPlaying') === 'true') {
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [audio]);

  useEffect(() => {
    // Save playlist and playback position to localStorage whenever they change
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('lastPlayingTrackIndex', currentTrackIndex.toString());
    localStorage.setItem('lastPlaybackPosition', audio.currentTime.toString());
    localStorage.setItem('isPlaying', isPlaying.toString());
  }, [playlist, currentTrackIndex, audio, isPlaying]);

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files.length === 0) {
      return;
    }

    const newPlaylist = [...playlist];

    for (const file of files) {
      newPlaylist.push({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }

    setPlaylist(newPlaylist);

    // Update the current track index only if it's out of bounds
    if (currentTrackIndex >= newPlaylist.length) {
      setCurrentTrackIndex(0);
    }

    // If the playlist was empty, start playing the first track
    if (!isPlaying && newPlaylist.length > 1) {
      playTrack(0);
    }
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    audio.src = playlist[index].url;

    // Set the playback position to 0 before starting to play a new track
    audio.currentTime = 0;

    audio.play();
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    // Check if the playlist is not empty
    if (playlist.length > 0) {
      // Check if audio.src is not set
      if (!audio.src) {
        // Set audio.src to the URL of the current track
        audio.src = playlist[currentTrackIndex].url;
        audio.load(); // Explicitly load the audio
      }

      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }

      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    // Play the next track when the current one ends
    if (currentTrackIndex < playlist.length - 1) {
      playTrack(currentTrackIndex + 1);
    } else {
      // Reset to the first track if the last one ends
      playTrack(0);
    }
  };

  return (
    <Box
    p={4}
    maxW="100%"
    m="auto"
    backgroundImage="url('https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg?cs=srgb&dl=pexels-daniel-reche-3721941.jpg&fm=jpg')" // Replace with your image path
    backgroundSize="cover"
    backgroundPosition="center"
    height="100vh" // Set height to 100% of the viewport height
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
  >
    <Box
      borderRadius="10px"
      p={4}
      boxShadow="md"
      mb={4}
    >
      <Input type="file" accept=".mp3" multiple onChange={handleFileChange} mb={4} />

      {playlist.length > 0 ? (
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="red" mb={2}>
            Playlist
          </Text>
          <UnorderedList>
            {playlist.map((track, index) => (
              <ListItem
                key={index}
                cursor="pointer"
                color="white"
                onClick={() => playTrack(index)}
                _hover={{ color: 'blue.500' }}
              >
                {track.name}
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      ) : (
        <Text fontSize="lg" color="red" mt={4}>
          No audio files in the playlist.
        </Text>
      )}
    </Box>

    {playlist.length > 0 && (
     <Box
     borderRadius="10px"
     p={4}
     boxShadow="md"
     mt={4}
     maxW="400px" // Set a maximum width for the box
     w="100%" // Make the box 100% width of its container
   >
     <Text fontSize="xl" fontWeight="bold" color="green">
       Now Playing
     </Text>
     <Text color="white">{playlist[currentTrackIndex] && playlist[currentTrackIndex].name}</Text>
     <Button onClick={handlePlayPause} colorScheme="teal" mt={2}>
       {isPlaying ? 'Pause' : 'Play'}
     </Button>
   </Box>
    )}

    <audio onEnded={handleEnded} />
  </Box>
  );
};

export default AudioPlayer;
