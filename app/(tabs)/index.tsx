import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import MusicList from '@/components/MusicList';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const MUSIC_DIR = FileSystem.documentDirectory + 'musicas/';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);




  const importarMusica = async () => {
    console.log('Iniciando importação de música...');
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/mpeg',
      copyToCacheDirectory: true,
    });

    console.log('Resultado da seleção:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.name;
      const destPath = MUSIC_DIR + fileName;

      console.log('Arquivo selecionado:', {
        nome: fileName,
        tamanho: asset.size,
        tipo: asset.mimeType,
        origem: asset.uri,
        destino: destPath
      });

      const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIR);
      if (!dirInfo.exists) {
        console.log('Criando diretório:', MUSIC_DIR);
        await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
      }

      console.log('Copiando arquivo para:', destPath);
      await FileSystem.copyAsync({
        from: asset.uri,
        to: destPath,
      });

      // Verifica se o arquivo foi copiado corretamente
      const fileInfo = await FileSystem.getInfoAsync(destPath);
      console.log('Arquivo copiado:', fileInfo);

      console.log('Música importada com sucesso!');
      alert('Música importada com sucesso!');
      setRefreshTrigger(prev => prev + 1); // Força atualização da lista
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Importar Música" onPress={importarMusica} />
      </View>

      <Text style={styles.title}>Lista de músicas:</Text>
      <MusicList refreshKey={refreshTrigger} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 50,
    backgroundColor: '#1a1a1a'
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  title: { 
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10
  },

});