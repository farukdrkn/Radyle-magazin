import { notFound } from 'next/navigation'
import Link from 'next/link'

// Paragraf gruplarını render eden fonksiyon
function renderChunk(nodes: any[]) {
  return nodes.map((node: any, i: number) => {
    if (node.type === 'paragraph') {
      return (
        <p key={i} className="mb-6 text-base md:text-xl leading-relaxed text-gray-800 font-medium">
          {node.children?.map((child: any) => child.text).join("")}
        </p>
      );
    }
    return null;
  });
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // Payload CMS bağımlılığını kaldırdık
  const post: any = null
  const relatedPosts: any[] = []

  if (!post) return notFound()

  const heroImageData = post?.heroImage as any;
  const rawUrl = heroImageData?.url || "";
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '');
  const imageUrl = rawUrl.startsWith('http') ? rawUrl : `${base}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;

  const allNodes = post.content?.root?.children || [];
  const chunkSize = 2; 
  const contentChunks = [];
  for (let i = 0; i < allNodes.length; i += chunkSize) {
    contentChunks.push(allNodes.slice(i, i + chunkSize));
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* GİRİŞ BÖLÜMÜ */}
      <section className="w-full flex flex-col md:flex-row border-b border-black/5 bg-white relative">
        {/* Mobilde normal resim (40vh), PC'de tam ekran ve yapışkan (sticky) */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative md:sticky md:top-0 overflow-hidden">
          <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center min-h-[50vh] md:min-h-screen bg-white z-10">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-8 hover:translate-x-1 transition-transform inline-block">
            ← RADYLE MAGAZİN
          </Link>
          <h1 className="text-3xl md:text-6xl font-black text-gray-900 leading-tight tracking-tighter uppercase mb-6">
            {post.title}
          </h1>
          <div className="w-12 h-1 bg-black mb-6"></div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
            {typeof post.category === 'object' ? post.category.title : 'Koleksiyon'} • 2026
          </p>
        </div>
      </section>

      {/* DİNAMİK İÇERİK BÖLÜMLERİ (Sağ-Sol Dergi Akışı) */}
      {contentChunks.map((chunk, index) => {
        const isImageRight = index % 2 === 0;

        return (
          <section 
            key={index} 
            className={`w-full flex flex-col ${isImageRight ? 'md:flex-row-reverse' : 'md:flex-row'} border-b border-black/5 relative`}
          >
            {/* Mobilde yazı üstü resim, PC'de sticky (yazı uzunsa ekranla beraber iner) */}
            <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative md:sticky md:top-0 overflow-hidden bg-gray-100">
              <img 
                src={imageUrl} 
                className="w-full h-full object-cover opacity-95 transition-opacity hover:opacity-100 duration-500" 
                alt="Radyle"
              />
            </div>

            {/* Metin Alanı - Desenli Arka Plan */}
            <div className={`w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center content-wrapper shadow-inner min-h-[50vh] md:min-h-screen z-10`}>
              <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md p-6 md:p-12 rounded-lg border border-white/50 shadow-xl">
                {renderChunk(chunk)}
              </div>
            </div>
          </section>
        );
      })}

      {/* BENZER YAZILAR BÖLÜMÜ */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto py-16 md:py-20 px-6 md:px-8 bg-[#FAF9F6] border-t border-black/5">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Devamını Oku</p>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Benzer Yazılar</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {relatedPosts.map((rPost: any) => {
              const rImageUrl = (rPost.heroImage as any)?.url || "";
              const rFinalUrl = rImageUrl.startsWith('http') ? rImageUrl : `${base}${rImageUrl.startsWith('/') ? rImageUrl : `/${rImageUrl}`}`;

              return (
                <Link key={rPost.id} href={`/posts/${rPost.slug || rPost.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden mb-4 bg-gray-100 shadow-md rounded-sm">
                    <img 
                      src={rFinalUrl || 'https://via.placeholder.com/600x800'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={rPost.title} 
                    />
                  </div>
                  <h4 className="text-base md:text-lg font-black leading-tight uppercase group-hover:text-blue-600 transition-colors">
                    {rPost.title}
                  </h4>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <footer className="w-full py-10 text-center border-t border-black/5 bg-[#FAF9F6]">
         <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">© 2026 Radyle Magazine</p>
      </footer>
    </div>
  )
}