import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameButton } from "@/components/ui/game-button";
import { GameCard } from "@/components/ui/game-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateDeviceId } from "@/lib/gameUtils";

const CreateRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [hostName, setHostName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [rounds, setRounds] = useState("5");
  const [clueTime, setClueTime] = useState("60");
  const [gameMode, setGameMode] = useState("classic");
  const [customThemes, setCustomThemes] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      toast.error("Digite seu nome!");
      return;
    }

    setLoading(true);

    try {
      const deviceId = generateDeviceId();
      const hostId = `host_${Date.now()}`;
      const themesArray = customThemes
        .split("\n")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code: code!,
          host_id: hostId,
          max_players: parseInt(maxPlayers),
          rounds: parseInt(rounds),
          clue_time: parseInt(clueTime),
          game_mode: gameMode,
          custom_themes: themesArray.length > 0 ? themesArray : null,
          status: 'lobby'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create host player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: hostName,
          is_host: true,
          is_ready: true,
          device_id: deviceId
        });

      if (playerError) throw playerError;

      toast.success("Sala criada com sucesso!");
      navigate(`/lobby/${code}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error("Erro ao criar sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-xl transition-smooth"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Criar Sala</h1>
            <p className="text-muted-foreground">Configure sua partida</p>
          </div>
        </div>

        {/* Room Code Card */}
        <GameCard variant="glass" className="text-center space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Código da sala</p>
            <p className="text-4xl font-bold tracking-widest font-mono">{code}</p>
          </div>
          <div className="flex gap-2">
            <GameButton
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copiado!" : "Copiar link"}
            </GameButton>
            <GameButton
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleShare}
            >
              Compartilhar
            </GameButton>
          </div>
        </GameCard>

        {/* Settings */}
        <GameCard>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hostName">Seu nome</Label>
              <Input
                id="hostName"
                placeholder="Digite seu nome"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="h-12 rounded-xl"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Jogadores</Label>
                <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                  <SelectTrigger id="maxPlayers" className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} jogadores</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rounds">Rodadas</Label>
                <Select value={rounds} onValueChange={setRounds}>
                  <SelectTrigger id="rounds" className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} rodadas</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clueTime">Tempo para dica</Label>
              <Select value={clueTime} onValueChange={setClueTime}>
                <SelectTrigger id="clueTime" className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 segundos</SelectItem>
                  <SelectItem value="45">45 segundos</SelectItem>
                  <SelectItem value="60">60 segundos</SelectItem>
                  <SelectItem value="90">90 segundos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameMode">Modo de jogo</Label>
              <Select value={gameMode} onValueChange={setGameMode}>
                <SelectTrigger id="gameMode" className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">
                    <div>
                      <div className="font-semibold">Clássico</div>
                      <div className="text-xs text-muted-foreground">100% na ordem correta</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="easy">
                    <div>
                      <div className="font-semibold">Cooperativo Fácil</div>
                      <div className="text-xs text-muted-foreground">Tolerância de 1 posição</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="chaos">
                    <div>
                      <div className="font-semibold">Caos</div>
                      <div className="text-xs text-muted-foreground">Temas malucos + tempo reduzido</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customThemes">Temas customizados (opcional)</Label>
              <Textarea
                id="customThemes"
                placeholder="Digite um tema por linha&#10;Ex: Temperatura de bebidas&#10;Velocidade de animais"
                value={customThemes}
                onChange={(e) => setCustomThemes(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Um tema por linha. Serão misturados com os temas padrão.
              </p>
            </div>
          </div>
        </GameCard>

        {/* Create Button */}
        <GameButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleCreateRoom}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar Sala e Entrar"}
        </GameButton>
      </div>
    </div>
  );
};

export default CreateRoom;
