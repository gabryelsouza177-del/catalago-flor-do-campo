export const CATEGORIES = [
  'Todos',
  'Buquês',
  'Orquídeas',
  'Arranjos',
  'Coroas',
  'Presentes',
  'Plantas',
] as const;

export const WHATSAPP_NUMBER = '5592991115403';

export function buildWhatsAppLink(productName: string, price: number, imageUrl?: string | null) {
  let text = `Olá! Tenho interesse no produto: *${productName}* (R$ ${price.toFixed(2).replace('.', ',')}).`;
  if (imageUrl) {
    text += `\n\n📷 Foto do produto: ${imageUrl}`;
  }
  text += `\n\nPoderia me enviar mais informações?`;
  const message = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
