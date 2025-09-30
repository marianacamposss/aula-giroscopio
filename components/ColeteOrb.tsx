import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 50;
const ORB_SIZE = 30;
// Fator de Sensibilidade. AUMENTAMOS a sensibilidade para compensar as unidades do Giroscópio.
// Mas se o movimento estiver muito rápido, você pode diminuir para, por exemplo, 20.
const SENSITIVITY_FACTOR = 40; 

const GAME_STATE = {
  READY: 'ready',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
};
const INITIAL_TIME = 30;

// Garante que o orbe não nasça fora dos limites
const generateRandomPosition = () => {
  const position = {
    x: Math.random() * (width - ORB_SIZE), 
    y: Math.random() * (height - ORB_SIZE), 
  };
  return position;
};

export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({ x: width / 2 - PLAYER_SIZE / 2, y: height / 2 - PLAYER_SIZE / 2 }); // Centraliza o jogador
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition());
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameState, setGameState] = useState(GAME_STATE.READY);

  // Função para reiniciar o jogo
  const resetGame = () => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    // Centraliza o jogador ao reiniciar
    setPlayerPosition({ x: width / 2 - PLAYER_SIZE / 2, y: height / 2 - PLAYER_SIZE / 2 }); 
    setOrbPosition(generateRandomPosition());
    setGameState(GAME_STATE.PLAYING);
  };

  // 1. Efeito do Giroscópio (Movimento do Jogador)
  useEffect(() => {
    Gyroscope.setUpdateInterval(10); 
    const subscription = Gyroscope.addListener(gyroscopeData => {
      setData(gyroscopeData);
    });
    return () => subscription.remove();
  }, []);

  // 2. Lógica de Movimento e Limites da Tela
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;

    // CORREÇÃO PRINCIPAL DE LÓGICA
    // Queremos que o objeto (bolinha) se mova na direção para onde o celular está 'inclinado' (como se fosse um labirinto)
    
    // Eixo X (Horizontal - Esquerda/Direita na tela): Rotação em torno do Eixo Y do celular (data.y)
    // Inclinar o celular para a direita (rotação Y positiva) deve mover a bolinha para a direita (X aumenta).
    // Inclinar o celular para a esquerda (rotação Y negativa) deve mover a bolinha para a esquerda (X diminui).
    // O sinal em 'data.y' está correto para isso.
    let deltaX = data.y * SENSITIVITY_FACTOR;
    let newX = playerPosition.x + deltaX; 
    
    // Eixo Y (Vertical - Cima/Baixo na tela): Rotação em torno do Eixo X do celular (data.x)
    // Inclinar o celular para frente (rotação X NEGATIVA) deve mover a bolinha para CIMA (Y diminui).
    // Inclinar o celular para trás (rotação X POSITIVA) deve mover a bolinha para BAIXO (Y aumenta).
    // Portanto, precisamos INVERTER o sinal de 'data.x'.
    let deltaY = data.x * SENSITIVITY_FACTOR;
    let newY = playerPosition.y + deltaY; 
    
    // OBSERVAÇÃO: A SUA LÓGICA ANTERIOR (newY = playerPosition.y - data.x * SENSITIVITY_FACTOR)
    // JÁ ESTAVA CORRETA para a direção! Se o celular for para frente (X negativo), a bolinha vai para cima (Y diminui).
    // O único problema pode ter sido a SENSITIVIDADE baixa ou a posição inicial.
    
    // Revertendo para sua lógica de sinal, mas com sensibilidade mais alta (SENSITIVITY_FACTOR = 40)
    newX = playerPosition.x + data.y * SENSITIVITY_FACTOR; 
    newY = playerPosition.y - data.x * SENSITIVITY_FACTOR; // SINAL AJUSTADO ANTERIORMENTE E MANTIDO

    // Limites da tela (para o Jogador)
    // Garante que a borda ESQUERDA da bolinha não seja menor que 0
    if (newX < 0) newX = 0;
    // Garante que a borda DIREITA da bolinha não seja maior que a largura da tela
    if (newX > width - PLAYER_SIZE) newX = width - PLAYER_SIZE;
    // Garante que a borda SUPERIOR da bolinha não seja menor que 0
    if (newY < 0) newY = 0;
    // Garante que a borda INFERIOR da bolinha não seja maior que a altura da tela
    if (newY > height - PLAYER_SIZE) newY = height - PLAYER_SIZE;

    setPlayerPosition({ x: newX, y: newY });
  }, [data, gameState]);

  // 3. Lógica de Colisão e Pontuação (Sem alterações)
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;

    const dx = playerCenterX - orbCenterX;
    const dy = playerCenterY - orbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (PLAYER_SIZE / 2) + (ORB_SIZE / 2)) {
      setScore(prevScore => prevScore + 1);
      setOrbPosition(generateRandomPosition());
    }
  }, [playerPosition, gameState]); 

  // 4. Lógica do Contador de Tempo (Sem alterações)
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;

    if (timeLeft <= 0) {
      setGameState(GAME_STATE.GAMEOVER);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);


  // 5. Exibe a tela de Game Over/Ready (Sem alterações)
  const renderGameOverlay = () => {
    if (gameState === GAME_STATE.READY) {
      return (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Bem-Vindo ao Gyro Orb! ⚽</Text>
          <Text style={styles.overlayText}>Incline seu telefone para mover a bola.</Text>
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
          <Text style={styles.overlayScore}>Pontuação Final: {score} 🎉</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Pontos: {score}</Text>
        <Text style={styles.headerText}>Tempo: {timeLeft}s</Text>
      </View>

      <Text style={styles.instructions}>Colete o orbe azul!</Text>
      
      <View
        style={[
          styles.orb,
          {
            left: orbPosition.x,
            top: orbPosition.y,
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
      
      {renderGameOverlay()}
    </View>
  );
}

// --- ESTILOS (Sem alterações) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructions: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    color: '#fff',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: 'coral',
    borderWidth: 2,
    borderColor: '#fff',
  },
  orb: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: '#3498db',
    borderWidth: 2,
    borderColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayTitle: {
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  overlayScore: {
    fontSize: 30,
    color: '#3498db',
    marginBottom: 40,
  },
  overlayText: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'coral',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, 
    fontWeight: 'bold',
  }
});