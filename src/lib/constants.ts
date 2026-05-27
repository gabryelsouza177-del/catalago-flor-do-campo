export const CATEGORIES = [
  'Todos',
  'Buquês',
  'Coroas',
  'Arranjos',
  'Presentes',
  'Plantas',
  'Promoções',
] as const;

export const WHATSAPP_NUMBER = '92991115403';

function normalizeWhatsAppNumber(number: string) {
  const digits = number.replace(/\D/g, '');

  if (digits.startsWith('55')) return digits;
  if (digits.length === 11) return `55${digits}`;

  return digits;
}

export function buildWhatsAppLink(productName: string, price: number, imageUrl?: string | null, description?: string | null) {
  let text = `Olá! Tenho interesse no produto: *${productName}* (R$ ${price.toFixed(2).replace('.', ',')}).`;
  if (description) {
    text += `\n\n📝 Descrição: ${description}`;
  }
  if (imageUrl) {
    text += `\n\n📷 Foto do produto: ${imageUrl}`;
  }
  text += `\n\nPoderia me enviar mais informações?`;
  const message = encodeURIComponent(text);
  return `https://wa.me/${normalizeWhatsAppNumber(WHATSAPP_NUMBER)}?text=${message}`;
}

export const NEIGHBORHOODS = [
  // Local
  { name: 'Centro', type: 'local' },
  { name: 'Cachoeirinha', type: 'local' },
  { name: 'Praça 14', type: 'local' },
  { name: 'Aparecida', type: 'local' },
  { name: 'São Geraldo', type: 'local' },
  { name: 'Adrianópolis', type: 'local' },
  { name: 'Vieiralves', type: 'local' },
  { name: 'Nossa Senhora das Graças', type: 'local' },
  { name: 'Chapada', type: 'local' },
  { name: 'Raiz', type: 'local' },
  { name: 'Petrópolis', type: 'local' },
  { name: 'São Francisco', type: 'local' },
  { name: 'Santa Luzia', type: 'local' },
  // Intermediária
  { name: 'Parque 10', type: 'intermediaria' },
  { name: 'Aleixo', type: 'intermediaria' },
  { name: 'Japiim', type: 'intermediaria' },
  { name: 'Coroado', type: 'intermediaria' },
  { name: 'Alvorada', type: 'intermediaria' },
  { name: 'Dom Pedro', type: 'intermediaria' },
  { name: 'Compensa', type: 'intermediaria' },
  { name: 'Ponta Negra', type: 'intermediaria' },
  { name: 'Flores', type: 'intermediaria' },
  { name: 'Parque das Laranjeiras', type: 'intermediaria' },
  { name: 'Cidade Nova', type: 'intermediaria' },
  { name: 'Novo Aleixo', type: 'intermediaria' },
  { name: 'Distrito Industrial', type: 'intermediaria' },
  // Distante
  { name: 'Jorge Teixeira', type: 'distancia' },
  { name: 'Santa Etelvina', type: 'distancia' },
  { name: 'Novo Israel', type: 'distancia' },
  { name: 'Lago Azul', type: 'distancia' },
  { name: 'Puraquequara', type: 'distancia' },
  { name: 'Tarumã', type: 'distancia' },
  { name: 'Colônia Antônio Aleixo', type: 'distancia' },
  { name: 'Nova Cidade', type: 'distancia' },
].sort((a, b) => a.name.localeCompare(b.name));
