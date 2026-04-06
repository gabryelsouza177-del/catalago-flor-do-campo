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

export function buildWhatsAppLink(productName: string, price: number) {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no produto: *${productName}* (R$ ${price.toFixed(2).replace('.', ',')}). Poderia me enviar mais informações?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
