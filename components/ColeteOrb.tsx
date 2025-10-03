import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 50;
const ORB_SIZE = 30;

// Estado de jogo (para controlar quando o jogador pode se mover)
const GAME_STATE = {
  READY: 'ready',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
};
const INITIAL_TIME = 30; // 30 segundos de jogo

const generateRandomPosition = () => {
  const position = {
    x: Math.random() * (width - ORB_SIZE),
    y: Math.random() * (height - ORB_SIZE),
  };
  return position;
};

export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({ x: width / 2, y: height / 2 });
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition());
  
  // NOVAS FUNCIONALIDADES:
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameState, setGameState] = useState(GAME_STATE.READY);

  // Função para reiniciar o jogo
  const resetGame = () => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setPlayerPosition({ x: width / 2, y: height / 2 });
    setOrbPosition(generateRandomPosition());
    setGameState(GAME_STATE.PLAYING);
  };

  // 1. Efeito do Giroscópio (Movimento do Jogador)
  useEffect(() => {
    Gyroscope.setUpdateInterval(16);
    const subscription = Gyroscope.addListener(gyroscopeData => {
      setData(gyroscopeData);
    });
    return () => subscription.remove();
  }, []);

  // 2. Lógica de Movimento e Limites da Tela
  useEffect(() => {
    // MOVE APENAS SE O JOGO ESTIVER EM ANDAMENTO
    if (gameState !== GAME_STATE.PLAYING) return;

    let newX = playerPosition.x - data.y * 10;
    let newY = playerPosition.y - data.x * 10;

    // Limites da tela
    if (newX < 0) newX = 0;
    if (newX > width - PLAYER_SIZE) newX = width - PLAYER_SIZE;
    if (newY < 0) newY = 0;
    if (newY > height - PLAYER_SIZE) newY = height - PLAYER_SIZE;

    setPlayerPosition({ x: newX, y: newY });
  }, [data, gameState]);

  // 3. Lógica de Colisão e Pontuação
  useEffect(() => {
    // VERIFICA COLISÃO APENAS SE O JOGO ESTIVER EM ANDAMENTO
    if (gameState !== GAME_STATE.PLAYING) return;

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;

    const dx = playerCenterX - orbCenterX;
    const dy = playerCenterY - orbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Colisão: distância entre os centros é menor que a soma dos raios
    if (distance < (PLAYER_SIZE / 2) + (ORB_SIZE / 2)) {
      // PONTO ADICIONADO AQUI:
      setScore(prevScore => prevScore + 1);
      setOrbPosition(generateRandomPosition());
    }
  }, [playerPosition, gameState]); // Depende do movimento do jogador

  // 4. Lógica do Contador de Tempo (Timer e Game Over)
  useEffect(() => {
    // TIMER SÓ FUNCIONA NO ESTADO PLAYING
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }

    if (timeLeft <= 0) {
      setGameState(GAME_STATE.GAMEOVER);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);


  // 5. Exibe a tela de Game Over/Ready
  const renderGameOverlay = () => {
    if (gameState === GAME_STATE.READY) {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Bem-Vindo ao Shark Orb!🦈🌊</Text>
          <Text style={styles.overlayText}>Incline seu telefone para mover o tubarão e capturar o peixinho🐠.</Text>
          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Começar Jogo!</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (gameState === GAME_STATE.GAMEOVER) {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>FIM DE JOGO!</Text>
          <Text style={styles.overlayScore}>Pontuação Final: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Jogar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Exibe a Pontuação e o Tempo no topo */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Pontos: {score}</Text>
        <Text style={styles.headerText}>Tempo: {timeLeft}s</Text>
      </View>

      <Text style={styles.instructions}>Colete o peixinho com o tubarão!</Text>
      
      <View
        style={[
          styles.orb,
          {
            left: orbPosition.x,
            top: orbPosition.y,
            // Oculta o orbe se o jogo não estiver em andamento
            opacity: gameState === GAME_STATE.PLAYING ? 1 : 0.2, 
          },
        ]}
      />
      
      <View
        style={[
          styles.player,
          {
            left: playerPosition.x,
            top: playerPosition.y,
          },
        ]}
      />
      
      {/* Renderiza a tela de Game Over ou Ready por cima de tudo */}
      {renderGameOverlay()}
    </View>
  );
}

// --- ESTILOS ADICIONAIS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9', // azul oceano
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    width: '100%',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructions: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#f0f9ff',
  },
  player: {
    position: 'absolute',
  width: 0,
  height: 0,
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderLeftWidth: PLAYER_SIZE / 2,
  borderRightWidth: PLAYER_SIZE / 2,
  borderBottomWidth: PLAYER_SIZE,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderBottomColor: '#475569', // cinza tubarão sólido
  transform: [{ rotate: '90deg' }], // faz ele apontar pra direita
  borderWidth: 0, // evita borda externa extra
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#ff6c03ff', // laranja peixe
    borderWidth: 2,
    borderColor: '#ff6c03ff',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#add0e7ff', // fundo azul clarinho
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#267edcff',
    marginBottom: 15,
    textAlign: 'center',
  },
  overlayScore: {
    fontSize: 26,
    color: '#2563eb',
    marginBottom: 25,
    fontWeight: '700',
  },
  overlayText: {
    fontSize: 18,
    color: '#1e3a8a',
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#267edcff',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});


