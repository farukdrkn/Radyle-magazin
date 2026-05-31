"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Check, 
  Loader2,
  ChevronDown
} from 'lucide-react'
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// Types
interface MediaItem {
  id: string
  file_name: string
  file_url: string
  storage_path: string
  created_at: string
}

export default function MediaPage() {
  const supabase = createClient()
  const [images, setImages] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [fileName, setFileName] = useState('')
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [isReCropping, setIsReCropping] = useState(false)
  
  // Crop States
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  // Popover State
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching images:', error)
    } else {
      setImages(data || [])
    }
    setLoading(false)
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFileName(file.name.split('.')[0])
      setEditingItem(null)
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setIsModalOpen(true)
        setShowUploadOptions(false)
      })
      reader.readAsDataURL(file)
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    )
    setCrop(crop)
  }

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas 2d context oluşturulamadı.')
    }

    // Görselin gerçek piksel boyutları ile ekrandaki boyutları arasındaki ölçek farkı
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Canvas boyutunu tam olarak kırpılan alanın piksel boyutuna çekiyoruz
    canvas.width = Math.floor(crop.width * scaleX)
    canvas.height = Math.floor(crop.height * scaleY)

    // Çizim kalitesini artırıyoruz
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Kaynak görselden (image) hedef tuvale (canvas) pikselleri kopyalıyoruz
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Kırpılmış Blob oluşturulamadı.'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.95 // %95 kalite
      )
    })
  }

  function sanitizeFileName(name: string): string {
    const trMap: { [key: string]: string } = {
      'ş': 's', 'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ç': 'c',
      'Ş': 's', 'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ö': 'o', 'Ç': 'c'
    }
    
    // 1. Convert to lowercase
    let sanitized = name.toLowerCase()
    
    // 2. Replace Turkish characters with English equivalents
    sanitized = sanitized.split('').map(char => trMap[char] || char).join('')
    
    // 3. Replace all spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-')
    
    // 4. Keep only letters, numbers, hyphens, and the file extension dot
    sanitized = sanitized.replace(/[^a-z0-9.-]/g, '')
    
    // Clean multiple consecutive hyphens or leading/trailing hyphens/dots
    sanitized = sanitized.replace(/-+/g, '-').replace(/^-+|-+$/g, '')
    
    return sanitized
  }

  async function handleSave() {
    // Eğer düzenleme modundaysak ve yeni bir kırpma yapılmamışsa (sadece isim değişikliği)
    if (editingItem && !isReCropping && !selectedFile) {
      await updateImageName()
      return
    }

    // Kırpma verisi kontrolü
    if (!completedCrop || !imgRef.current) {
      alert('Lütfen bir alan seçin veya kırpma işleminin tamamlanmasını bekleyin.')
      return
    }

    setUploading(true)
    try {
      // 1. GERÇEK KIRPILMIŞ BLOB ÜRETİMİ
      // getCroppedImg fonksiyonu canvas kullanarak yeni bir Blob döner
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      
      if (!croppedBlob) {
        throw new Error('Kırpılmış görsel dosyası üretilemedi.')
      }

      // Sanitize filename to prevent Supabase storage key errors
      const sanitizedName = sanitizeFileName(fileName)

      // Dosya yolu belirleme (Yeniden kırpmada mevcut yolu korur, yeni yüklemede tarih basar)
      const fileExt = 'jpg'
      const filePath = editingItem ? editingItem.storage_path : `${Date.now()}-${sanitizedName}.${fileExt}`

      // 2. SUPABASE STORAGE YÜKLEME
      // ÖNEMLİ: Burada selectedFile yerine kesinlikle croppedBlob gönderiliyor
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage Hatası:', uploadError)
        throw new Error(`Görsel yüklenemedi: ${uploadError.message}`)
      }

      // 3. PUBLIC URL ALMA
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path)

      // 4. VERİTABANI GÜNCELLEME VEYA EKLEME
      if (editingItem) {
        const { error: dbError } = await supabase
          .from('media')
          .update({ 
            file_name: sanitizedName, 
            file_url: publicUrl 
          })
          .eq('id', editingItem.id)

        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase
          .from('media')
          .insert([{ 
            file_name: sanitizedName, 
            file_url: publicUrl, 
            storage_path: uploadData.path 
          }])

        if (dbError) throw dbError
      }

      await fetchImages()
      closeModal()
    } catch (error: any) {
      console.error('Kritik Kayıt Hatası:', error)
      alert(`Hata: ${error.message || 'Görsel kaydedilirken bir hata oluştu.'}`)
    } finally {
      setUploading(false)
    }
  }

  async function updateImageName() {
    if (!editingItem) return
    setUploading(true)
    try {
      const sanitizedName = sanitizeFileName(fileName)
      const { error } = await supabase
        .from('media')
        .update({ file_name: sanitizedName })
        .eq('id', editingItem.id)
      
      if (error) throw error
      
      // Update local state directly for immediate feedback
      setImages(images.map(img => 
        img.id === editingItem.id ? { ...img, file_name: sanitizedName } : img
      ))
      
      closeModal()
    } catch (error: any) {
      console.error('Error updating name:', error)
      alert(`İsim güncellenirken hata: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return

    try {
      // 1. Delete from Storage (using the exact storage_path from DB)
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([item.storage_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Storage'da dosya bulunamasa bile DB kaydını silmeye devam edebiliriz 
        // veya burada durabiliriz. Güvenli tarafta kalıp devam ediyoruz.
      }

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', item.id)

      if (dbError) {
        console.error('Database Delete Error:', JSON.stringify(dbError))
        throw new Error(`Veritabanı Hatası: ${dbError.message}`)
      }

      setImages(images.filter(img => img.id !== item.id))
    } catch (error: any) {
      console.error('Delete Error Detail:', error)
      alert(`Görsel silinirken bir hata oluştu: ${error.message}`)
    }
  }

  function handleEdit(item: MediaItem) {
    setEditingItem(item)
    setFileName(item.file_name)
    setImgSrc(item.file_url)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedFile(null)
    setImgSrc('')
    setFileName('')
    setEditingItem(null)
    setIsReCropping(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-32">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Medya Galerisi</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Supabase Storage ile bağlı canlı medya yönetimi.</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowUploadOptions(!showUploadOptions)}
            className="bg-black text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl"
          >
            <Upload size={16} />
            Görsel Yükle
            <ChevronDown size={14} className={`transition-transform ${showUploadOptions ? 'rotate-180' : ''}`} />
          </button>

          {showUploadOptions && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <ImageIcon size={16} className="text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Dosyalar</span>
                <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
              </label>
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <Plus size={16} className="text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Galeri</span>
                <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
              </label>
            </div>
          )}
        </div>
      </header>

      {/* Drag & Drop Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = () => {
              setImgSrc(reader.result?.toString() || '');
              setFileName(file.name.split('.')[0]);
              setIsModalOpen(true);
            };
            reader.readAsDataURL(file);
          }
        }}
        className="mb-16 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center bg-white/50 hover:border-black/20 hover:bg-white transition-all cursor-pointer group"
      >
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
          <ImageIcon className="text-gray-300" size={32} />
        </div>
        <p className="text-sm font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Görseli buraya sürükleyin</p>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-gray-300" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {images.map((img) => (
            <div key={img.id} className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50">
              <div className="aspect-[4/5] overflow-hidden bg-gray-50">
                <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              </div>
              <div className="p-5 flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest truncate text-gray-800">{img.file_name}</p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(img)}
                    className="flex-1 h-10 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(img)}
                    className="flex-1 h-10 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Henüz hiç görsel yüklenmemiş.</p>
        </div>
      )}

      {/* Crop & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col h-[85vh]">
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Görseli Düzenle</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Kırpma ve isimlendirme işlemleri.</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-12 bg-gray-50/50">
                {/* Crop Area */}
                <div className="flex-1 flex items-center justify-center bg-white rounded-[2rem] p-4 shadow-inner min-h-[300px]">
                  {editingItem && !selectedFile && !isReCropping ? (
                    <img src={imgSrc} className="max-w-full max-h-[50vh] rounded-xl shadow-lg" alt="" />
                  ) : (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      className="max-h-[50vh]"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                        crossOrigin="anonymous"
                        className="max-w-full max-h-[50vh]"
                      />
                    </ReactCrop>
                  )}
                </div>

                {/* Settings Area */}
                <div className="w-full md:w-80 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Görsel İsmi</label>
                    <input 
                      type="text" 
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Görsel adı girin..."
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                    />
                  </div>
                  
                  {editingItem && !isReCropping && (
                    <button 
                      onClick={() => setIsReCropping(true)}
                      className="w-full bg-white border border-gray-200 text-gray-800 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <Pencil size={16} />
                      Resmi Yeniden Kırp
                    </button>
                  )}

                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Bilgi</p>
                    <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                      Görseli 1:1 oranında kırparak dergi mizanpajına uygun hale getiriyoruz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-gray-100 flex justify-end items-center gap-4 bg-white">
                <button 
                  onClick={closeModal}
                  className="px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleSave}
                  disabled={uploading}
                  className="bg-black text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {uploading ? 'Kaydediliyor...' : 'Görseli Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
