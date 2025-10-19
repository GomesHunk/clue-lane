import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GameCard } from "@/components/ui/game-card";

// Placeholder for the full game flow
const Game = () => {
  const { code } = useParams();
  const location = useLocation();
  const [gameState, setGameState] = useState("briefing");

  const players = location.state?.players || [];
  const settings = location.state?.settings;

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sala {code}</h1>
          <p className="text-muted-foreground">Rodada 1 de {settings?.rounds || 5}</p>
        </div>

        <GameCard variant="gradient" className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4">Em breve!</h2>
          <p className="text-primary-foreground/80 mb-6">
            O jogo completo está sendo desenvolvido
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto text-sm text-primary-foreground/80">
            <p>✨ Receber número secreto</p>
            <p>💡 Dar dicas criativas</p>
            <p>🎯 Ordenar jogadores</p>
            <p>🎊 Revelar resultados</p>
            <p>🏆 Sistema de pontuação</p>
          </div>
        </GameCard>
      </div>
    </div>
  );
};

export default Game;
