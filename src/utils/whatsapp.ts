import { Order } from '../types';
import { formatIDR, formatWeight } from './currency';

/**
 * Normalizes an Indonesian phone number to international WhatsApp format.
 * E.g., '08123456789' -> '628123456789'
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  return '62' + digits;
}

/**
 * Generates WhatsApp URL to confirm an order.
 */
export function generateWhatsAppOrderUrl(targetStorePhone: string, order: Order): string {
  const formattedPhone = cleanPhoneNumber(targetStorePhone);
  
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.productName || (item as any).name} (${formatWeight(item.quantity, item.unit)}) - ${formatIDR(item.subtotal)}`
    )
    .join('\n');

  const fulfillmentDetail =
    order.fulfillmentMethod === 'delivery'
      ? `Pengantaran (Kurir/Ojek Lokal)\nAlamat: ${order.customerAddress}`
      : 'Pengambilan Langsung (Pickup di Toko Avatar Meatshop)';

  const notesText = order.orderNotes ? `\nCatatan: ${order.orderNotes}` : '';

  const message = `Halo Avatar Meatshop, saya ingin konfirmasi pesanan baru:

📋 *DETAIL PESANAN*
*No. Pesanan:* ${order.id}
*Nama Pemesan:* ${order.customerName}
*No. WhatsApp:* ${order.customerPhone}

📦 *METODE PEMENUHAN:*
${fulfillmentDetail}

🛒 *ITEM PESANAN:*
${itemsText}

💰 *RINGKASAN BIAYA:*
Subtotal: ${formatIDR(order.subtotal)}
Ongkos Kirim: ${formatIDR(order.deliveryFee)}
*Total Pembayaran:* ${formatIDR(order.total)}
*Metode Pembayaran:* ${order.paymentMethod === 'cod' ? 'COD (Bayar di Tempat)' : 'QRIS (Simulasi Demo)'}
*Status Pembayaran:* ${order.paymentStatus}${notesText}

Mohon segera diproses pesanan saya. Terima kasih! 🙏`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp URL for a quick product inquiry.
 */
export function generateWhatsAppProductInquiry(
  targetStorePhone: string,
  productName: string,
  quantity?: number,
  isWholesale?: boolean
): string {
  const formattedPhone = cleanPhoneNumber(targetStorePhone);
  const qtyText = quantity ? ` sebanyak ${quantity} kg/pcs` : '';
  const wholesaleText = isWholesale ? ' untuk kebutuhan grosir' : '';

  const message = `Halo Avatar Meatshop, saya tertarik dan ingin menanyakan ketersediaan produk *${productName}*${qtyText}${wholesaleText}. Apakah masih tersedia? Terima kasih!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp URL for customer contact form.
 */
export function generateWhatsAppContactUrl(
  targetStorePhone: string,
  senderName: string,
  messageBody: string,
  subject?: string
): string {
  const formattedPhone = cleanPhoneNumber(targetStorePhone);
  const subjectLine = subject ? `\n*Perihal:* ${subject}` : '';

  const message = `Halo Avatar Meatshop,
Nama saya: *${senderName}*${subjectLine}

*Pesan:*
${messageBody}

Terima kasih!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp URL for admin to contact customer regarding their order status.
 */
export function generateAdminOrderContactUrl(order: Order): string {
  const formattedPhone = cleanPhoneNumber(order.customerPhone);
  const message = `Halo Kak ${order.customerName}, kami dari *Avatar Meatshop*. 
Terkait pesanan *#${order.id}*, saat ini status pesanan Kakak adalah: *${order.orderStatus}*.

Jika ada pertanyaan atau butuh bantuan lebih lanjut, silakan balas pesan ini. Terima kasih telah berbelanja di Avatar Meatshop! 🥩`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
