import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameButton } from "@/components/ui/game-button";
import { Input } from "@/components/ui/input";
import { Sparkles, Users, Lightbulb, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generateRoomCode } from "@/lib/gameUtils";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    navigate(`/create-room/${code}`);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || roomCode.length < 4) {
      toast.error("Digite um código válido");
      return;
    }

    setLoading(true);
    const code = roomCode.toUpperCase();

    try {
      const response = await fetch(`${API_URL}/api/rooms/${code}`);
      
      if (!response.ok) {
        toast.error("Sala não encontrada");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.room.status === 'finished') {
        toast.error("Esta sala já terminou");
        setLoading(false);
        return;
      }

      navigate(`/lobby/${code}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error("Erro ao entrar na sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary shadow-primary animate-bounce-subtle">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ITO
          </h1>
          <p className="text-lg text-muted-foreground">
            Ordene os números através de dicas criativas!
          </p>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <GameButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCreateRoom}
          >
            <Users className="w-5 h-5 mr-2" />
            Criar Sala
          </GameButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="text-center text-lg tracking-widest font-mono h-14 rounded-2xl"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <GameButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleJoinRoom}
              disabled={!roomCode.trim() || loading}
            >
              {loading ? "Entrando..." : "Entrar na Sala"}
            </GameButton>
          </div>
        </div>

        {/* How to Play */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-smooth underline">
              Como jogar?
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Como Jogar ITO</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receba seu número</h3>
                  <p className="text-sm text-muted-foreground">
                    Cada jogador recebe secretamente um número de 1 a 100
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl gradient-secondary flex items-center justify-center text-secondary-foreground font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 flex items-center gap-2">
                    Dê uma dica <Lightbulb className="w-4 h-4" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Descreva seu número com base no tema, sem revelá-lo diretamente
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center text-accent-foreground font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ordene o grupo</h3>
                  <p className="text-sm text-muted-foreground">
                    Discutam e organizem todos do menor para o maior número
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Revele e pontue!</h3>
                  <p className="text-sm text-muted-foreground">
                    Se a ordem estiver correta, o grupo pontua. Joguem várias rodadas!
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Melhor experiência em dispositivos mobile</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
