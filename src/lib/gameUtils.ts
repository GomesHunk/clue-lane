export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateDeviceId(): string {
  const stored = localStorage.getItem('ito_device_id');
  if (stored) return stored;
  
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('ito_device_id', deviceId);
  return deviceId;
}

export function distributeNumbers(playerCount: number): number[] {
  const numbers: number[] = [];
  const min = 1;
  const max = 100;
  
  while (numbers.length < playerCount) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  return numbers;
}

export function checkOrder(players: Array<{ secret_number: number | null; position: number | null }>, mode: string): { correct: boolean; mistakes: number } {
  const sorted = [...players]
    .filter(p => p.secret_number !== null && p.position !== null)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  let mistakes = 0;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if ((sorted[i].secret_number || 0) > (sorted[i + 1].secret_number || 0)) {
      mistakes++;
    }
  }
  
  if (mode === 'classic') {
    return { correct: mistakes === 0, mistakes };
  } else if (mode === 'easy') {
    return { correct: mistakes <= 1, mistakes };
  }
  
  return { correct: mistakes === 0, mistakes };
}

export function validateClue(clue: string): { valid: boolean; message?: string } {
  if (!clue.trim()) {
    return { valid: false, message: 'A dica não pode estar vazia' };
  }
  
  if (clue.length < 3) {
    return { valid: false, message: 'A dica precisa ter pelo menos 3 caracteres' };
  }
  
  if (clue.length > 200) {
    return { valid: false, message: 'A dica não pode ter mais de 200 caracteres' };
  }
  
  // Check for explicit numbers
  const numberWords = [
    'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
    'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte',
    'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa', 'cem', 'cento'
  ];
  
  const lowerClue = clue.toLowerCase();
  for (const word of numberWords) {
    if (lowerClue.includes(word)) {
      return { valid: false, message: 'Não use números por extenso na dica' };
    }
  }
  
  // Check for digits
  if (/\d/.test(clue)) {
    return { valid: false, message: 'Não use números na dica' };
  }
  
  return { valid: true };
}
