import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Radyle Dijital Dergi Gizlilik Politikası ve Çerez Bilgilendirmesi.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full min-h-screen bg-transparent py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 md:p-16">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
          Gizlilik Politikası
        </h1>
        <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full mb-10" />
        
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
          <p>
            Radyle olarak gizliliğinize büyük önem veriyoruz. Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde topladığımız veri türlerini ve bunları nasıl kullandığımızı açıklamaktadır.
          </p>
          
          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Toplanan Veriler ve Kullanımı
          </h2>
          <p>
            Sitemizin performansını analiz etmek ve kullanıcı deneyimini iyileştirmek amacıyla **Google Analytics** gibi üçüncü taraf analitik araçlarını kullanmaktayız. Google Analytics, ziyaretçilerin siteyi nasıl kullandıklarına dair anonim istatistiksel verileri (örneğin ziyaret edilen sayfalar, sitede geçirilen süre, kullanılan tarayıcı türü vb.) toplar.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Çerezler (Cookies)
          </h2>
          <p>
            Radyle, kullanıcı deneyimini kişiselleştirmek ve iyileştirmek amacıyla çerezler kullanmaktadır. Çerezler, web sitemizin daha hızlı ve verimli çalışması için tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Tarayıcı ayarlarınızdan çerez tercihlerinizi değiştirebilir veya tamamen engelleyebilirsiniz.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Veri Güvenliği
          </h2>
          <p>
            Toplanan tüm veriler, yetkisiz erişimi veya ifşayı önlemek amacıyla uygun güvenlik önlemleriyle korunmaktadır. Radyle, kullanıcıların kişisel bilgilerini yasal zorunluluklar haricinde üçüncü şahıslara satmaz, kiralamaz veya paylaşmaz.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Politika Değişiklikleri
          </h2>
          <p>
            Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikleri takip edebilmeniz için bu sayfayı düzenli olarak kontrol etmenizi öneririz.
          </p>

          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-12">
            Son güncelleme: Haziran 2026
          </p>
        </div>
      </div>
    </main>
  )
}
