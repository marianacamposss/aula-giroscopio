import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  highScore: number;
  onStartGame: () => void;
  timeBonus: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ highScore, onStartGame, timeBonus }) => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>🎮 Gyro Orb 🎮</Text>
      <Text style={styles.overlayScore}>Recorde: {highScore}</Text> 
      <Text style={styles.overlayText}>Colete a orbe inclinando seu telefone.</Text>
      <Text style={styles.overlayText}>Você ganha **{timeBonus} segundos** por orbe!</Text>
      <TouchableOpacity style={styles.button} onPress={onStartGame}> 
        <Text style={styles.buttonText}>Começar Jogo!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fffbeb', // fundo clarinho amarelo pastel
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  overlayTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f97316', // laranja vibrante
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#fcd34d', // amarelo claro
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  overlayScore: {
    fontSize: 26,
    color: '#2563eb', // azul vibrante
    marginBottom: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 18,
    color: '#1e293b', // cinza escuro para contraste
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#a855f7', // roxo divertido
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30, // bem arredondado, estilo “bubble”
    minWidth: 240,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});


export default HomeScreen;