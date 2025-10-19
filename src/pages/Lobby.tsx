import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameButton } from "@/components/ui/game-button";
import { GameCard } from "@/components/ui/game-card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Check, Crown, User } from "lucide-react";
import { toast } from "sonner";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { supabase } from "@/integrations/supabase/client";
import { distributeNumbers } from "@/lib/gameUtils";
import { getRandomTheme } from "@/lib/gameThemes";

const Lobby = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);

  const { room, players, loading, error } = useRoom(code!);
  const { player, deviceId } = usePlayer(room?.id);

  useEffect(() => {
    if (player) {
      setJoined(true);
      setPlayerName(player.name);
    }
  }, [player]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => navigate("/"), 2000);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (room?.status !== 'lobby' && room?.status !== undefined) {
      navigate(`/game/${code}`);
    }
  }, [room?.status, code, navigate]);

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

  const handleJoin = async () => {
    if (!playerName.trim()) {
      toast.error("Digite seu nome!");
      return;
    }

    if (!room) return;

    if (players.length >= room.max_players) {
      toast.error("Sala cheia!");
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: playerName,
          is_host: false,
          is_ready: false,
          device_id: deviceId
        });

      if (error) throw error;

      setJoined(true);
      toast.success("Você entrou na sala!");
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error("Erro ao entrar na sala");
    }
  };

  const handleStartGame = async () => {
    if (!room || !player?.is_host) return;

    if (players.length < 3) {
      toast.error("Precisa de pelo menos 3 jogadores!");
      return;
    }

    try {
      // Distribute secret numbers
      const numbers = distributeNumbers(players.length);
      const updates = players.map((p, index) => ({
        id: p.id,
        secret_number: numbers[index],
        position: index
      }));

      for (const update of updates) {
        await supabase
          .from('players')
          .update({ secret_number: update.secret_number, position: update.position })
          .eq('id', update.id);
      }

      // Select first theme
      const theme = getRandomTheme([], room.custom_themes || []);

      // Update room status
      await supabase
        .from('rooms')
        .update({
          status: 'briefing',
          current_round: 1,
          current_theme: theme
        })
        .eq('id', room.id);

      toast.success("Jogo iniciado!");
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error("Erro ao iniciar o jogo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground">Carregando sala...</p>
        </div>
      </div>
    );
  }

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
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
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
                {players.length} / {room?.max_players} {players.length === 1 ? "jogador" : "jogadores"}
              </p>
            </div>
          </div>
        </div>

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

        {player?.is_host && room && (
          <GameCard>
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Configurações da Partida</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Jogadores:</div>
                <div className="font-medium">Até {room.max_players}</div>
                
                <div className="text-muted-foreground">Rodadas:</div>
                <div className="font-medium">{room.rounds}</div>
                
                <div className="text-muted-foreground">Tempo de dica:</div>
                <div className="font-medium">{room.clue_time}s</div>
                
                <div className="text-muted-foreground">Modo:</div>
                <div className="font-medium capitalize">{
                  room.game_mode === "classic" ? "Clássico" :
                  room.game_mode === "easy" ? "Coop Fácil" : "Caos"
                }</div>
              </div>
            </div>
          </GameCard>
        )}

        <GameCard>
          <h3 className="font-semibold mb-4">Jogadores</h3>
          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-smooth"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  p.is_host ? "gradient-primary" : "bg-accent"
                }`}>
                  {p.is_host ? (
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <User className="w-6 h-6 text-accent-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.is_host ? "Host" : p.is_ready ? "Pronto" : "Esperando..."}
                  </p>
                </div>
                {p.is_ready && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                )}
              </div>
            ))}
          </div>
        </GameCard>

        {player?.is_host && (
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

        {!player?.is_host && (
          <div className="text-center text-sm text-muted-foreground">
            Aguardando o host iniciar a partida...
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
