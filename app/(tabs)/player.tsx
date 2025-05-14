import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const MUSIC_DIR = FileSystem.documentDirectory + 'musicas/';

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function Player() {
  const params = useLocalSearchParams();
  const { musicName } = params;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allMusic, setAllMusic] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadMusicList();
  }, []);

  useEffect(() => {
    if (musicName && allMusic.length > 0) {
      const index = allMusic.indexOf(musicName as string);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [musicName, allMusic]);

  useEffect(() => {
    resetPlayer();
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentIndex, allMusic]);

  const resetPlayer = () => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  };

  const loadMusicList = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIR);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(MUSIC_DIR);
      const mp3s = files.filter(f => f.endsWith('.mp3'));
      setAllMusic(mp3s);
    } catch (error) {
      console.error('Erro ao carregar lista de músicas:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const playNext = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    const nextIndex = (currentIndex + 1) % allMusic.length;
    setCurrentIndex(nextIndex);
  };

  const playPrevious = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    const prevIndex = (currentIndex - 1 + allMusic.length) % allMusic.length;
    setCurrentIndex(prevIndex);
  };

  const loadAudio = async () => {
    try {
      const currentMusic = allMusic[currentIndex];
      if (!currentMusic) return;

      const fileInfo = await FileSystem.getInfoAsync(MUSIC_DIR + currentMusic);
      console.log('Carregando áudio:', fileInfo);

      if (!fileInfo.exists) {
        console.error('Arquivo não encontrado:', musicName);
        return;
      }

      // Configura o áudio
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: fileInfo.uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );

      // Configura o volume
      await audioSound.setVolumeAsync(1.0);

      setSound(audioSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Erro ao carregar áudio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{allMusic[currentIndex]}</Text>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(currentTime / duration) * 100}%` }]} />
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={[styles.controlButton, styles.playButton]}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={40} 
            color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressContainer: {
    width: screenWidth - 40,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    marginVertical: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeContainer: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#1DB954',
    borderRadius: 50,
    marginHorizontal: 30,
  },
  timeText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'monospace',
  },
});
