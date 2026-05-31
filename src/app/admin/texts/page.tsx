"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Save, 
  Trash2, 
  FileText, 
  ChevronRight,
  Loader2,
  Undo,
  Redo,
  Palette,
  Check,
  RefreshCw
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// 8+ Renkten oluşan geniş palet
const COLORS = [
  { name: 'Siyah', hex: '#000000' },
  { name: 'Kömür Gri', hex: '#374151' },
  { name: 'Yakut Kırmızısı', hex: '#E11D48' },
  { name: 'Okyanus Mavisi', hex: '#2563EB' },
  { name: 'Zümrüt Yeşili', hex: '#059669' },
  { name: 'Canlı Turuncu', hex: '#EA580C' },
  { name: 'Derin Mor', hex: '#7C3AED' },
  { name: 'Zarif Pembe', hex: '#DB2777' },
]

interface TextRecord {
  id: string
  title: string
  content: string
  created_at: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL Girin:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // Aktif buton stilleri - Anlık feedback için Tailwind sınıfları
  const activeBtnClass = "bg-indigo-600 text-white shadow-md transform scale-105"
  const inactiveBtnClass = "text-gray-500 hover:bg-gray-100 hover:text-gray-700"

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex gap-1 pr-2 border-r border-gray-100">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-20 transition-all"
          title="Geri Al"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-20 transition-all"
          title="İleri Al"
        >
          <Redo size={18} />
        </button>
      </div>

      <div className="flex gap-1 px-2 border-r border-gray-100">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('bold') ? activeBtnClass : inactiveBtnClass}`}
          title="Kalın"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('italic') ? activeBtnClass : inactiveBtnClass}`}
          title="İtalik"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={addLink}
          className={`p-2 rounded-lg transition-all duration-200 ${editor.isActive('link') ? activeBtnClass : inactiveBtnClass}`}
          title="Bağlantı Ekle"
        >
          <LinkIcon size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-3 items-center">
        {COLORS.map((color) => {
          const isActive = editor.isActive('textStyle', { color: color.hex })
          return (
            <button
              key={color.hex}
              onClick={() => editor.chain().focus().setColor(color.hex).run()}
              className={`group relative w-6 h-6 rounded-full border border-gray-200 transition-all hover:scale-125 flex items-center justify-center shadow-sm`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isActive && (
                <Check size={12} className={color.hex === '#000000' || color.hex === '#374151' ? 'text-white' : 'text-white drop-shadow-md'} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function TextsPage() {
  const supabase = createClient()
  const [texts, setTexts] = useState<TextRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [, forceUpdate] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Temiz <p> tagları için yapılandırma
        paragraph: {
          HTMLAttributes: {
            class: 'editor-paragraph mb-4 last:mb-0',
          },
        },
        // Bold ve Italic'in renkleri ezmemesi için inherit özelliği
        bold: {
          HTMLAttributes: {
            class: 'font-bold text-inherit',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'italic text-inherit',
          },
        },
      }),
      TextStyle,
      Color,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
    ],
    content: '',
    onTransaction: () => {
      // Reaktif UI güncellemesi için transaction dinleyicisi
      forceUpdate(prev => prev + 1)
    },
    editorProps: {
      attributes: {
        // prose-strong:text-inherit ve prose-em:text-inherit ile Tailwind'in varsayılan renk dayatmalarını kırıyoruz
        class: 'prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[500px] px-6 py-4 prose-strong:text-inherit prose-em:text-inherit',
      },
    },
  })

  const fetchTexts = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('texts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Veriler çekilirken hata oluştu:', JSON.stringify(error))
    } else {
      setTexts(data || [])
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTexts()
  }, [fetchTexts])

  const loadText = (record: TextRecord) => {
    setSelectedId(record.id)
    setTitle(record.title)
    editor?.commands.setContent(record.content)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lütfen bir başlık girin.')
      return
    }

    setIsSaving(true)
    const content = editor?.getHTML() || ''

    // Yalnızca title ve content alanlarını içeren saf payload. Language vb. hiçbir alan gönderilmiyor.
    const payload = {
      title: title.trim(),
      content: content
    }

    try {
      if (selectedId) {
        // UPDATE
        const { error: dbError } = await supabase
          .from('texts')
          .update(payload)
          .eq('id', selectedId)

        if (dbError) throw dbError
      } else {
        // INSERT
        const { error: dbError } = await supabase
          .from('texts')
          .insert([payload])

        if (dbError) throw dbError
        
        // Yeni kayıt sonrası alanları temizleme
        setTitle('')
        editor?.commands.setContent('')
        setSelectedId(null)
      }

      await fetchTexts()
      alert('Başarıyla kaydedildi!')
    } catch (dbError: any) {
      // Hata objesini boş {} görünümünü engellemek için JSON.stringify ile net şekilde logluyoruz
      console.error('Kayıt hatası:', JSON.stringify(dbError))
      alert(`Kayıt sırasında bir hata oluştu: ${dbError?.message || 'Bilinmeyen hata (Konsolu inceleyin)'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu metni silmek istediğinize emin misiniz?')) return

    const { error } = await supabase.from('texts').delete().eq('id', id)
    if (error) {
      console.error('Silme hatası:', JSON.stringify(error))
      alert('Silme işlemi başarısız oldu.')
    } else {
      if (selectedId === id) {
        setSelectedId(null)
        setTitle('')
        editor?.commands.setContent('')
      }
      fetchTexts()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#fdfdfd] overflow-hidden">
      {/* Sidebar - Geçmiş Metinler Listesi */}
      <aside className="w-72 border-r border-gray-100 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText size={18} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Arşivlenenler</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="animate-spin text-indigo-400" size={24} />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Yükleniyor</span>
            </div>
          ) : texts.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-gray-200 flex justify-center"><FileText size={32} /></div>
              <p className="text-xs font-medium text-gray-400">Henüz kayıt yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {texts.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadText(item)}
                  className={`group relative p-5 cursor-pointer transition-all ${
                    selectedId === item.id 
                      ? 'bg-indigo-50/40 border-l-4 border-indigo-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs font-bold truncate mb-1.5 ${selectedId === item.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {item.title}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Ana İçerik - Editör Bölümü */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Palette size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">İçerik Stüdyosu</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                {selectedId ? 'Düzenleme Modu' : 'Yeni Taslak'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {selectedId && (
                <button 
                  onClick={() => {
                    setSelectedId(null)
                    setTitle('')
                    editor?.commands.setContent('')
                  }}
                  className="group flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                >
                  <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  Vazgeç / Yeni Metin
                </button>
              )}

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="group bg-black text-white px-12 py-4.5 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-40 shadow-2xl shadow-black/10"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Kaydet
              </button>
            </div>
          </header>

          <div className="space-y-8">
            {/* Başlık Girişi */}
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 focus-within:ring-2 ring-indigo-100 transition-all">
              <div className="px-6 py-4">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
                  Yazı Başlığı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Başlık girin..."
                  className="w-full text-2xl font-bold text-gray-800 placeholder:text-gray-200 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Zengin Editör Alanı */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
              <MenuBar editor={editor} />
              <div className="relative">
                <EditorContent editor={editor} />
                
                {/* Alt Bilgi / İpucu */}
                <div className="absolute bottom-4 right-6 pointer-events-none">
                  <div className="flex items-center gap-2 bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Canlı Senkronizasyon Aktif</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 px-8 text-[10px] text-gray-400 italic leading-relaxed">
              <span className="text-indigo-500 font-bold not-italic">NOT:</span>
              <p>Her paragraf bağımsız bir yapı oluşturur. Bu düzen, ön yüzdeki dinamik görsellerle eşleşen 'zikzak' yerleşimin hatasız çalışmasını sağlar. Renkler, kalın (bold) metinlerde bile korunur.</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
        
        .editor-paragraph {
          transition: all 0.2s ease;
        }

        /* Tiptap editörünün içindeki strong ve em etiketlerinin 
           üst sınıflardan renk almasını (override) engellemek için kritik CSS */
        .prose strong, .prose b {
          color: inherit !important;
        }
        .prose em, .prose i {
          color: inherit !important;
        }
      `}</style>
    </div>
  )
}
