/**
 * Gestión de Categorías (Admin)
 * 
 * CRUD completo de categorías:
 * - Ver lista de categorías
 * - Crear nuevas categorías
 * - Editar categorías existentes
 * - Eliminar categorías
 */

import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, ActivityIndicator, Modal } from 'react-native'
import { useRouter } from 'expo-router'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getToken } from '@/lib/auth'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'

type Category = {
  id: number
  name: string
  slug: string
}

export default function AdminCategoriasScreen() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function cargarCategorias() {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  function manejarCrear() {
    setNewCategoryName('')
    setShowCreateModal(true)
  }

  async function confirmarCrear() {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío')
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        router.replace('/login')
        return
      }

      await createCategory(token, { name: newCategoryName.trim() })
      Alert.alert('Éxito', 'Categoría creada correctamente')
      setShowCreateModal(false)
      setNewCategoryName('')
      cargarCategorias()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear categoría')
    }
  }

  async function manejarActualizar(category: Category) {
    if (!editingName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío')
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        router.replace('/login')
        return
      }

      await updateCategory(token, category.id, { name: editingName.trim() })
      Alert.alert('Éxito', 'Categoría actualizada correctamente')
      setEditingId(null)
      setEditingName('')
      cargarCategorias()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar categoría')
    }
  }

  async function manejarEliminar(category: Category) {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${category.name}"?\n\nLos productos de esta categoría quedarán sin categoría.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken()
              if (!token) {
                router.replace('/login')
                return
              }

              await deleteCategory(token, category.id)
              Alert.alert('Éxito', 'Categoría eliminada correctamente')
              cargarCategorias()
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al eliminar categoría')
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={FalabellaColors.primary} />
          </Pressable>
          <Text style={styles.title}>Categorías</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FalabellaColors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={FalabellaColors.primary} />
        </Pressable>
        <Text style={styles.title}>Categorías</Text>
        <Pressable onPress={manejarCrear} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={FalabellaColors.primary} />
        </Pressable>
      </View>

      {/* Lista de categorías */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            {editingId === item.id ? (
              <>
                <TextInput
                  value={editingName}
                  onChangeText={setEditingName}
                  style={styles.editInput}
                  autoFocus
                />
                <View style={styles.editActions}>
                  <Pressable
                    onPress={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                    style={styles.editButton}
                  >
                    <IconSymbol name="xmark" size={20} color={FalabellaColors.error} />
                  </Pressable>
                  <Pressable onPress={() => manejarActualizar(item)} style={styles.editButton}>
                    <IconSymbol name="checkmark" size={20} color={FalabellaColors.success} />
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categorySlug}>{item.slug}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <Pressable
                    onPress={() => {
                      setEditingId(item.id)
                      setEditingName(item.name)
                    }}
                    style={styles.actionButton}
                  >
                    <IconSymbol name="pencil" size={18} color={FalabellaColors.primary} />
                  </Pressable>
                  <Pressable onPress={() => manejarEliminar(item)} style={styles.actionButton}>
                    <IconSymbol name="trash" size={18} color={FalabellaColors.error} />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="folder" size={64} color={FalabellaColors.textMuted} />
            <Text style={styles.emptyText}>No hay categorías</Text>
            <Pressable onPress={manejarCrear} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Crear primera categoría</Text>
            </Pressable>
          </View>
        }
      />

      {/* Modal para crear categoría */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Categoría</Text>
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nombre de la categoría"
              placeholderTextColor={FalabellaColors.textMuted}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={[styles.modalButton, styles.modalButtonCancel]}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmarCrear}
                style={[styles.modalButton, styles.modalButtonConfirm]}
              >
                <Text style={styles.modalButtonTextConfirm}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FalabellaColors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: FalabellaColors.text,
  },
  categorySlug: {
    fontSize: 13,
    color: FalabellaColors.textMuted,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: FalabellaColors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 15,
    color: FalabellaColors.text,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: FalabellaColors.textMuted,
    marginTop: 16,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: FalabellaColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: FalabellaColors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: FalabellaColors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: FalabellaColors.backgroundGray,
  },
  modalButtonConfirm: {
    backgroundColor: FalabellaColors.primary,
  },
  modalButtonTextCancel: {
    color: FalabellaColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})
