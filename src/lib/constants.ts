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
