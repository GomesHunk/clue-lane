import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { GameButton } from "@/components/ui/game-button";
import { GameCard } from "@/components/ui/game-card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Check, Crown, User } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

const Lobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const isHost = location.state?.isHost || false;
  const roomSettings = location.state?.settings;

  useEffect(() => {
    if (isHost && location.state?.hostName) {
      setPlayerName(location.state.hostName);
      setJoined(true);
      setPlayers([{
        id: "host",
        name: location.state.hostName,
        isHost: true,
        isReady: true
      }]);
    }
  }, [isHost, location.state]);

  const roomUrl = `${window.location.origin}/lobby/${code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Jogar ITO",
          text: `Entre na sala ${code}!`,
          url: roomUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      toast.error("Digite seu nome!");
      return;
    }
    setJoined(true);
    // Simulate adding player
    setPlayers([...players, {
      id: Math.random().toString(36),
      name: playerName,
      isHost: false,
      isReady: false
    }]);
    toast.success("Você entrou na sala!");
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      toast.error("Precisa de pelo menos 3 jogadores!");
      return;
    }
    navigate(`/game/${code}`, { state: { players, settings: roomSettings } });
  };

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Sala {code}</h1>
            <p className="text-muted-foreground">Digite seu nome para entrar</p>
          </div>

          <GameCard variant="glass">
            <div className="space-y-4">
              <Input
                placeholder="Seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="h-14 rounded-2xl text-center text-lg"
                maxLength={20}
              />
              <GameButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleJoin}
              >
                Entrar
              </GameButton>
            </div>
          </GameCard>

          <button
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-muted rounded-xl transition-smooth"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Sala {code}</h1>
              <p className="text-sm text-muted-foreground">
                {players.length} {players.length === 1 ? "jogador" : "jogadores"}
              </p>
            </div>
          </div>
        </div>

        {/* Share Card */}
        <GameCard variant="glass" className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Convide amigos</p>
            <p className="text-xs truncate text-muted-foreground">{roomUrl}</p>
          </div>
          <div className="flex gap-2">
            <GameButton
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </GameButton>
            <GameButton
              variant="primary"
              size="sm"
              onClick={handleShare}
              className="flex-shrink-0"
            >
              Compartilhar
            </GameButton>
          </div>
        </GameCard>

        {/* Settings Info */}
        {isHost && roomSettings && (
          <GameCard>
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Configurações da Partida</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Jogadores:</div>
                <div className="font-medium">Até {roomSettings.maxPlayers}</div>
                
                <div className="text-muted-foreground">Rodadas:</div>
                <div className="font-medium">{roomSettings.rounds}</div>
                
                <div className="text-muted-foreground">Tempo de dica:</div>
                <div className="font-medium">{roomSettings.clueTime}s</div>
                
                <div className="text-muted-foreground">Modo:</div>
                <div className="font-medium capitalize">{
                  roomSettings.gameMode === "classic" ? "Clássico" :
                  roomSettings.gameMode === "easy" ? "Coop Fácil" : "Caos"
                }</div>
              </div>
            </div>
          </GameCard>
        )}

        {/* Players List */}
        <GameCard>
          <h3 className="font-semibold mb-4">Jogadores</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-smooth"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  player.isHost ? "gradient-primary" : "bg-accent"
                }`}>
                  {player.isHost ? (
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <User className="w-6 h-6 text-accent-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.isHost ? "Host" : player.isReady ? "Pronto" : "Esperando..."}
                  </p>
                </div>
                {player.isReady && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                )}
              </div>
            ))}
          </div>
        </GameCard>

        {/* Start Button (Host only) */}
        {isHost && (
          <GameButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStartGame}
            disabled={players.length < 3}
          >
            Iniciar Jogo
          </GameButton>
        )}

        {!isHost && (
          <div className="text-center text-sm text-muted-foreground">
            Aguardando o host iniciar a partida...
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
