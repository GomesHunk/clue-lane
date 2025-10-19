import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameCard } from "@/components/ui/game-card";
import { GameButton } from "@/components/ui/game-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRoom } from "@/hooks/useRoom";
import { usePlayer } from "@/hooks/usePlayer";
import { supabase } from "@/integrations/supabase/client";
import { validateClue, checkOrder } from "@/lib/gameUtils";
import { getRandomTheme } from "@/lib/gameThemes";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles } from "lucide-react";

const Game = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { room, players, loading } = useRoom(code!);
  const { player } = usePlayer(room?.id);

  const [showNumber, setShowNumber] = useState(false);
  const [clue, setClue] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (room?.status === 'lobby') {
      navigate(`/lobby/${code}`);
    }
  }, [room?.status, code, navigate]);

  useEffect(() => {
    if (room?.status === 'clues' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, room?.status]);

  useEffect(() => {
    if (room?.status === 'clues') {
      setTimeLeft(room.clue_time);
    }
  }, [room?.status, room?.clue_time]);

  const handleSubmitClue = async () => {
    if (!player || !room) return;

    const validation = validateClue(clue);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      await supabase
        .from('players')
        .update({ clue, is_ready: true })
        .eq('id', player.id);

      toast.success("Dica enviada!");
    } catch (error) {
      console.error('Error submitting clue:', error);
      toast.error("Erro ao enviar dica");
    }
  };

  const handleNextPhase = async () => {
    if (!room || !player?.is_host) return;

    try {
      if (room.status === 'briefing') {
        await supabase
          .from('rooms')
          .update({ status: 'clues' })
          .eq('id', room.id);
      } else if (room.status === 'clues') {
        await supabase
          .from('rooms')
          .update({ status: 'discussion' })
          .eq('id', room.id);
      } else if (room.status === 'discussion') {
        await supabase
          .from('rooms')
          .update({ status: 'reveal' })
          .eq('id', room.id);
      } else if (room.status === 'reveal') {
        const result = checkOrder(players, room.game_mode);

        await supabase
          .from('round_results')
          .insert({
            room_id: room.id,
            round_number: room.current_round,
            theme: room.current_theme || '',
            was_correct: result.correct,
            mistakes: result.mistakes
          });

        if (room.current_round < room.rounds) {
          const usedThemes = await supabase
            .from('round_results')
            .select('theme')
            .eq('room_id', room.id);

          const theme = getRandomTheme(
            usedThemes.data?.map(r => r.theme) || [],
            room.custom_themes || []
          );

          const numbers = distributeNumbers(players.length);
          for (let i = 0; i < players.length; i++) {
            await supabase
              .from('players')
              .update({
                secret_number: numbers[i],
                clue: null,
                is_ready: false,
                position: i
              })
              .eq('id', players[i].id);
          }

          await supabase
            .from('rooms')
            .update({
              status: 'briefing',
              current_round: room.current_round + 1,
              current_theme: theme
            })
            .eq('id', room.id);
        } else {
          await supabase
            .from('rooms')
            .update({ status: 'finished' })
            .eq('id', room.id);
        }
      }
    } catch (error) {
      console.error('Error changing phase:', error);
      toast.error("Erro ao avançar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (!room || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard variant="glass" className="text-center">
          <p className="text-muted-foreground">Sala não encontrada</p>
          <GameButton onClick={() => navigate("/")} className="mt-4">
            Voltar ao início
          </GameButton>
        </GameCard>
      </div>
    );
  }

  // Briefing Phase
  if (room.status === 'briefing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Rodada {room.current_round} de {room.rounds}</h1>
          </div>

          <GameCard variant="gradient" className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary-foreground" />
            <h2 className="text-2xl font-bold mb-4 text-primary-foreground">Tema desta rodada:</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              {room.current_theme}
            </p>
            <p className="text-sm text-primary-foreground/80">
              Prepare-se para dar uma dica criativa sobre seu número!
            </p>
          </GameCard>

          {player.is_host && (
            <GameButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNextPhase}
            >
              Começar a dar dicas
            </GameButton>
          )}

          {!player.is_host && (
            <p className="text-center text-muted-foreground">
              Aguarde o host iniciar...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Clues Phase
  if (room.status === 'clues') {
    return (
      <div className="min-h-screen p-4 animate-fade-in">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Rodada {room.current_round}</h1>
            <p className="text-lg text-muted-foreground">{room.current_theme}</p>
            <div className="mt-4">
              <div className="text-4xl font-bold text-primary">{timeLeft}s</div>
              <p className="text-sm text-muted-foreground">restantes</p>
            </div>
          </div>

          <GameCard variant="glass" className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Seu número secreto</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl font-bold font-mono">
                {showNumber ? player.secret_number : "??"}
              </div>
              <button
                onClick={() => setShowNumber(!showNumber)}
                className="p-3 rounded-xl hover:bg-muted transition-smooth"
              >
                {showNumber ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </GameCard>

          <GameCard>
            <h3 className="font-semibold mb-4">Sua dica</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Digite uma dica criativa sem revelar seu número..."
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                className="min-h-[120px] rounded-xl"
                maxLength={200}
                disabled={player.is_ready}
              />
              <GameButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSubmitClue}
                disabled={player.is_ready || !clue.trim()}
              >
                {player.is_ready ? "Dica enviada ✓" : "Enviar dica"}
              </GameButton>
            </div>
          </GameCard>

          <GameCard>
            <h3 className="font-semibold mb-4">Status dos jogadores</h3>
            <div className="space-y-2">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/50">
                  <span>{p.name}</span>
                  {p.is_ready ? (
                    <span className="text-sm text-accent">✓ Pronto</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Escrevendo...</span>
                  )}
                </div>
              ))}
            </div>
          </GameCard>

          {player.is_host && players.every(p => p.is_ready) && (
            <GameButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNextPhase}
            >
              Ir para discussão
            </GameButton>
          )}
        </div>
      </div>
    );
  }

  // Placeholder for other phases
  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sala {code}</h1>
          <p className="text-muted-foreground">Fase: {room.status}</p>
        </div>

        <GameCard variant="gradient" className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4 text-primary-foreground">Em desenvolvimento!</h2>
          <p className="text-primary-foreground/80 mb-6">
            As fases de discussão, revelação e resultado estão sendo implementadas.
          </p>
        </GameCard>
      </div>
    </div>
  );
};

function distributeNumbers(length: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < length) {
    const num = Math.floor(Math.random() * 100) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers;
}

export default Game;
