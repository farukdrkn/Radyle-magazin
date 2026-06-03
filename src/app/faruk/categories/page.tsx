"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  GripVertical, 
  Plus, 
  Pencil, 
  ChevronDown, 
  ChevronRight, 
  Trash2,
  FolderOpen,
  Settings2,
  Check,
  X,
  Loader2,
  Menu
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { saveCategory, deleteCategory, batchUpdateCategories } from '../dbActions'

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  order_index: number
  children?: Category[]
}

const generateSlug = (name: string) => {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  }
  return name
    .split('')
    .map(c => trMap[c] || c)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Recursively builds the tree
const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
  return items
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => a.order_index - b.order_index)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }))
}

interface SortableItemProps {
  category: Category
  depth: number
  onRename: (id: string, name: string) => void
  onAddSub: (parentId: string) => void
  onDelete: (id: string) => void
}

function SortableItem({ category, depth, onRename, onAddSub, onDelete }: SortableItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const hasChildren = category.children && category.children.length > 0

  const handleSaveRename = () => {
    if (editName.trim() && editName !== category.name) {
      onRename(category.id, editName)
    }
    setIsEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div 
        className={`group flex items-center bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Grip Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-600 transition-colors">
          <GripVertical size={18} />
        </div>

        {/* Toggle / Icon */}
        <div className="flex items-center gap-1 ml-1">
          {hasChildren ? (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-lg hover:bg-gray-50 text-indigo-600 transition-colors"
            >
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="p-1 text-gray-200">
              <ChevronRight size={18} />
            </div>
          )}
        </div>

        {/* Name / Input */}
        <div className="flex-1 ml-2 flex items-center gap-2">
          {depth === 0 && <FolderOpen size={16} className="text-indigo-400" />}
          {isEditing ? (
            <input 
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              className="bg-gray-50 border-b-2 border-indigo-500 text-sm font-bold uppercase tracking-widest px-2 py-1 outline-none w-full"
            />
          ) : (
            <span className={`text-sm font-bold uppercase tracking-widest ${depth > 0 ? 'text-gray-600' : 'text-gray-900'}`}>
              {category.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button onClick={handleSaveRename} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all">
                <Check size={14} />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Düzenle">
                <Pencil size={14} />
              </button>
              <button onClick={() => onAddSub(category.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Alt Menü Ekle">
                <Plus size={14} />
              </button>
              <button onClick={() => onDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Sil">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nested Sortable Context */}
      {isOpen && hasChildren && (
        <div className="mt-2 space-y-2 border-l-2 border-indigo-50 ml-10 pl-2">
          <SortableContext items={category.children!.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {category.children!.map(child => (
              <SortableItem 
                key={child.id} 
                category={child} 
                depth={depth + 1} 
                onRename={onRename} 
                onAddSub={onAddSub} 
                onDelete={onDelete} 
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const supabase = createClient()
  const [rawCategories, setRawCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error: dbError } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, order_index, created_at')
        .order('order_index', { ascending: true })

      if (dbError) throw dbError
      setRawCategories(data || [])
    } catch (error: any) {
      console.error('Kategoriler çekilirken hata:', JSON.stringify(error))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const tree = useMemo(() => buildTree(rawCategories), [rawCategories])

  const handleAddCategory = async (parentId: string | null = null) => {
    const name = window.prompt(parentId ? 'Alt kategori ismi:' : 'Yeni kategori ismi:')
    if (!name || !name.trim()) return

    const trimmedName = name.trim()
    const slug = generateSlug(trimmedName)
    const orderIndex = rawCategories.filter(c => c.parent_id === parentId).length

    try {
      await saveCategory({
        name: trimmedName,
        slug,
        parent_id: parentId,
        order_index: orderIndex
      })
      fetchCategories()
    } catch (error: any) {
      console.error('Ekleme hatası:', error)
      alert(`Kategori eklenemedi: ${error.message || 'Bilinmeyen hata'}`)
    }
  }

  const handleRename = async (id: string, newName: string) => {
    const trimmedName = newName.trim()
    const slug = generateSlug(trimmedName)
    const cat = rawCategories.find(c => c.id === id)
    if (!cat) return

    try {
      await saveCategory({
        id,
        name: trimmedName,
        slug,
        parent_id: cat.parent_id,
        order_index: cat.order_index
      })
      setRawCategories(prev => prev.map(c => c.id === id ? { ...c, name: trimmedName, slug } : c))
    } catch (error: any) {
      console.error('Güncelleme hatası:', error)
      alert(`Kategori güncellenemedi: ${error.message || 'Bilinmeyen hata'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi ve tüm alt kategorilerini silmek istediğinize emin misiniz?')) return

    try {
      await deleteCategory(id)
      fetchCategories()
    } catch (error: any) {
      console.error('Silme hatası:', error)
      alert(`Kategori silinemedi: ${error.message || 'Bilinmeyen hata'}`)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeItem = rawCategories.find(c => c.id === active.id)
    const overItem = rawCategories.find(c => c.id === over.id)
    
    if (!activeItem || !overItem) return

    // Sadece aynı seviyedeki sıralamayı yapıyoruz (Basitlik ve sağlamlık için)
    if (activeItem.parent_id !== overItem.parent_id) {
      // Ebeveyn değiştirme logic'i (Opsiyonel: Gelişmiş sürükle bırak)
      try {
        await saveCategory({
          id: active.id as string,
          name: activeItem.name,
          slug: activeItem.slug,
          parent_id: overItem.parent_id,
          order_index: activeItem.order_index
        })
      } catch (err) {
        console.error('Taşıma hatası:', err)
      }
      fetchCategories()
      return
    }

    const sameLevelItems = rawCategories
      .filter(c => c.parent_id === activeItem.parent_id)
      .sort((a, b) => a.order_index - b.order_index)

    const oldIndex = sameLevelItems.findIndex(c => c.id === active.id)
    const newIndex = sameLevelItems.findIndex(c => c.id === over.id)

    const newSorted = arrayMove(sameLevelItems, oldIndex, newIndex)

    // Batch update order_index
    const updates = newSorted.map((item, index) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      parent_id: item.parent_id,
      order_index: index
    }))

    try {
      await batchUpdateCategories(updates)
      fetchCategories()
    } catch (error: any) {
      console.error('Sıralama hatası:', error)
      alert(`Sıralama kaydedilemedi: ${error.message || 'Bilinmeyen hata'}`)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto min-h-screen">
      <header className="mb-12 flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
              <Menu size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Kategori Yönetimi</h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] ml-0.5">Sidebar ve Menü Yapılandırması</p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-50 border border-gray-100 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yükleniyor...</span>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={rawCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tree.map((item) => (
                  <SortableItem 
                    key={item.id} 
                    category={item} 
                    depth={0} 
                    onRename={handleRename}
                    onAddSub={handleAddCategory}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Global Add Button */}
        <button 
          onClick={() => handleAddCategory(null)}
          className="w-full mt-10 p-8 border-2 border-dashed border-gray-100 rounded-[2rem] flex items-center justify-center gap-4 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all group overflow-hidden relative"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white rounded-full flex items-center justify-center transition-all duration-500 shadow-sm">
              <Plus size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Yeni Ana Menü Ekle</span>
          </div>
        </button>
      </div>

      <footer className="mt-16 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-gray-300">
          <div className="h-px w-12 bg-gray-100" />
          <Settings2 size={16} />
          <div className="h-px w-12 bg-gray-100" />
        </div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Değişiklikler senkronize ediliyor • Radyle System v2</p>
      </footer>
    </div>
  )
}
