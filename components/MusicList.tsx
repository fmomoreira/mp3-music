import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';

const MUSIC_DIR = FileSystem.documentDirectory + 'musicas/';

interface MusicListProps {
  refreshKey?: number;
}

export default function MusicList({ refreshKey }: MusicListProps) {
  const [musicas, setMusicas] = useState<string[]>([]);


  useEffect(() => {
    listarMusicas();
  }, [refreshKey]); // Recarrega quando refreshKey mudar

  const listarMusicas = async () => {
    console.log('Iniciando listagem de músicas...');
    const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIR);
    if (!dirInfo.exists) {
      console.log('Diretório de músicas não existe:', MUSIC_DIR);
      return;
    }
    console.log('Diretório de músicas encontrado:', dirInfo);

    const arquivos = await FileSystem.readDirectoryAsync(MUSIC_DIR);
    console.log('Arquivos encontrados:', arquivos);
    
    const mp3s = arquivos.filter((f) => f.endsWith('.mp3'));
    console.log('Arquivos MP3 filtrados:', mp3s);
    
    setMusicas(mp3s);
  };

  const navegarParaPlayer = (nomeArquivo: string) => {
    console.log('Navegando para o player com a música:', nomeArquivo);
    router.push({ pathname: '/player', params: { musicName: nomeArquivo } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={musicas}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navegarParaPlayer(item)} style={styles.item}>
            <Text style={styles.text}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1
  },
  item: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: 'white',
    flex: 1
  },
});
