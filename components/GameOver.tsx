import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface GameOverProps {
  finalScore: number;
  highScore: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ finalScore, highScore, onPlayAgain, onGoHome }) => {
  const isNewRecord = finalScore > highScore;
  
  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>FIM DE JOGO!</Text>
      <Text style={styles.overlayScore}>
        Pontuação Final: {finalScore} {isNewRecord ? "👑 NOVO RECORDE!" : ""}
      </Text>
      <Text style={styles.overlayText}>Recorde Atual: {Math.max(finalScore, highScore)}</Text>
      
      <TouchableOpacity style={{ ...styles.button, marginBottom: 15 }} onPress={onPlayAgain}> 
        <Text style={styles.buttonText}>Jogar Novamente</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={onGoHome}> 
        <Text style={styles.buttonText}>Página Inicial</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fef9c3', // amarelo pastel
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  overlayTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#dc2626', // vermelho vibrante
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#fca5a5',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  overlayScore: {
    fontSize: 28,
    color: '#2563eb', // azul vibrante
    marginBottom: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#16a34a', // verde alegre
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 220,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  homeButton: {
    backgroundColor: '#3b82f6', // azul para “voltar”
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});


export default GameOver;