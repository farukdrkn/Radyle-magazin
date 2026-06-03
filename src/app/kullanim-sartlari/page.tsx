import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Şartları',
  description: 'Radyle Dijital Dergi Platformu Kullanım Şartları ve Koşulları.',
}

export default function TermsOfUsePage() {
  return (
    <main className="w-full min-h-screen bg-transparent py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 md:p-16">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
          Kullanım Şartları
        </h1>
        <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full mb-10" />
        
        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
          <p>
            Radyle web sitesine erişerek veya bu siteyi kullanarak aşağıdaki şartları ve koşulları kabul etmiş sayılırsınız. Eğer bu şartları kabul etmiyorsanız, lütfen siteyi kullanmayınız.
          </p>
          
          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Fikri Mülkiyet Hakları
          </h2>
          <p>
            Radyle'de yayınlanan tüm makaleler, görseller, logolar, grafikler, tasarımlar ve diğer tüm içerikler Radyle'ye aittir ve uluslararası telif hakkı yasalarıyla korunmaktadır. Bu içeriklerin hiçbiri, Radyle'nin önceden yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz, dağıtılamaz veya herhangi bir mecrada ticari amaçla kullanılamaz.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Sorumluluk Sınırlandırması
          </h2>
          <p>
            Radyle, web sitesinde yer alan içeriklerin doğruluğunu ve güncelliğini sağlamak için azami özen göstermektedir. Ancak sitemizde yer alan bilgilerin eksiksizliği, doğruluğu veya belirli bir amaca uygunluğu konusunda açık veya zımni hiçbir garanti verilmemektedir. Sitedeki içeriklerin kullanımından doğabilecek doğrudan veya dolaylı hiçbir zarardan Radyle sorumlu tutulamaz.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Kullanıcı Yükümlülükleri
          </h2>
          <p>
            Ziyaretçiler, sitemizi yalnızca yasal amaçlarla ve toplumsal ahlaka uygun şekilde kullanmayı taahhüt eder. Site altyapısına zarar verebilecek veya diğer kullanıcıların deneyimini olumsuz etkileyebilecek hiçbir girişimde bulunulamaz.
          </p>

          <h2 className="text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-white mt-10">
            Değişiklik Hakları
          </h2>
          <p>
            Radyle, bu kullanım şartlarını dilediği zaman, önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Sitenin güncel kullanım şartlarını takip etmek kullanıcının sorumluluğundadır.
          </p>

          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-12">
            Son güncelleme: Haziran 2026
          </p>
        </div>
      </div>
    </main>
  )
}
