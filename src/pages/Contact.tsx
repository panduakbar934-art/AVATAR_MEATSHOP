import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateWhatsAppContactUrl, cleanPhoneNumber } from '../utils/whatsapp';
import { useToast } from '../components/Toast';
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  MessageSquare,
  Send,
  Navigation,
  ExternalLink,
} from 'lucide-react';

export const Contact: React.FC = () => {
  const { settings } = useStore();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Pertanyaan Produk & Pemesanan');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Mohon isi nama dan pesan Anda.', 'error');
      return;
    }

    const waUrl = generateWhatsAppContactUrl(
      settings.whatsappNumber,
      name.trim(),
      message.trim(),
      subject
    );

    showToast('Mengarahkan ke WhatsApp toko...', 'info');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const rawPhone = cleanPhoneNumber(settings.whatsappNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="max-w-2xl">
        <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider">
          Hubungi Kami
        </span>
        <h1
          className="text-3xl sm:text-4xl font-black text-[#191919] tracking-tight mt-1"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          Kontak & Lokasi Avatar Meatshop
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
          Ada pertanyaan seputar potongan daging, pasokan rutin usaha katering atau resto Anda? Tim kami siap melayani dengan cepat dan ramah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs space-y-6">
            <h2 className="font-bold text-lg text-[#191919] pb-3 border-b border-stone-100">
              Informasi Toko
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF3B20]/10 flex items-center justify-center text-[#FF3B20] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#191919] font-bold">Alamat Toko:</strong>
                  <span className="text-stone-600 leading-relaxed block mt-0.5">
                    {settings.storeAddress}
                  </span>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF3B20] hover:underline mt-1"
                  >
                    <span>Petunjuk Arah Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#191919] font-bold">WhatsApp Resmi:</strong>
                  <a
                    href={`https://wa.me/${rawPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-800 font-semibold hover:text-[#FF3B20] transition-colors block mt-0.5"
                  >
                    {settings.whatsappNumber}
                  </a>
                  <span className="text-xs text-stone-400">Respon cepat selama jam kerja</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#191919] font-bold">Jam Operasional:</strong>
                  <span className="text-stone-600 block mt-0.5">{settings.operationalHours}</span>
                  <span className="text-xs text-stone-400">Pemesanan online buka 24 jam</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-[#191919] font-bold">Email Layanan:</strong>
                  <span className="text-stone-600 block mt-0.5">halo@avatarmeatshop.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview Mock Card */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-md relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF3B20] uppercase tracking-wider block">
                Pengambilan Langsung
              </span>
              <h3 className="font-bold text-lg text-white">Layanan Pick Up Toko</h3>
              <p className="text-stone-400 text-xs leading-relaxed">
                Anda dapat memilih metode Pick Up saat checkout dan mengambil pesanan langsung di toko kami tanpa antre.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-bold text-lg text-[#191919]">Kirim Pesan Langsung</h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Pesan akan langsung disusun rapi dan diteruskan ke WhatsApp customer service kami.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nama Anda / Nama Usaha <span className="text-[#FF3B20]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rina / Kafe Nusantara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nomor WhatsApp Anda
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Topik / Subjek
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white font-medium text-stone-800"
                >
                  <option value="Pertanyaan Produk & Pemesanan">Pertanyaan Produk & Pemesanan</option>
                  <option value="Penawaran Suplai Grosir Restoran / Katering">
                    Penawaran Suplai Grosir Restoran / Katering
                  </option>
                  <option value="Request Potongan Daging Kustom">Request Potongan Daging Kustom</option>
                  <option value="Status Pengantaran / Pesanan">Status Pengantaran / Pesanan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Isi Pesan <span className="text-[#FF3B20]">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan pertanyaan Anda secara lengkap..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B20] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan ke WhatsApp Toko</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
