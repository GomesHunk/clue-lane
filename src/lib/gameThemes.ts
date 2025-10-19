export const DEFAULT_THEMES = [
  "Temperatura de comidas (do mais frio ao mais quente)",
  "Tamanho de animais (do menor ao maior)",
  "Intensidade de filmes (do mais leve ao mais pesado)",
  "Preço de itens de mercado",
  "Velocidade de meios de transporte",
  "Nível de pimenta em pratos",
  "Distância de cidades brasileiras da capital",
  "Popularidade de esportes",
  "Dificuldade de idiomas para aprender",
  "Idade de invenções tecnológicas",
  "Altura de prédios famosos",
  "Duração de filmes clássicos",
  "Número de páginas de livros famosos",
  "Custo de carros populares",
  "Calorias de comidas típicas",
  "Intensidade de exercícios físicos",
  "Periculosidade de esportes radicais",
  "Frequência de uso de apps no celular",
  "Dificuldade de jogos de videogame",
  "Complexidade de receitas culinárias"
];

export function getRandomTheme(excludeThemes: string[] = [], customThemes: string[] = []): string {
  const allThemes = [...DEFAULT_THEMES, ...customThemes];
  const availableThemes = allThemes.filter(theme => !excludeThemes.includes(theme));
  
  if (availableThemes.length === 0) {
    return DEFAULT_THEMES[Math.floor(Math.random() * DEFAULT_THEMES.length)];
  }
  
  return availableThemes[Math.floor(Math.random() * availableThemes.length)];
}
