/**
 * Gestión de Usuarios (Admin)
 * 
 * CRUD completo de usuarios:
 * - Ver lista de usuarios
 * - Crear nuevos usuarios con rol
 * - Editar usuarios existentes
 * - Eliminar usuarios
 * - Asignar roles (CUSTOMER/ADMIN)
 */

import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getToken } from '@/lib/auth'
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api'

type User = {
  id: number
  name: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
}

export default function AdminUsersScreen() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        router.replace('/login')
        return
      }

      const data = await getUsers(token, { page: 1, limit: 100, search: searchQuery })
      setUsers(Array.isArray(data.items) ? data.items : [])
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CUSTOMER'
    })
    setModalVisible(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setModalVisible(true)
  }

  async function handleSave() {
    try {
      if (!formData.name || !formData.email) {
        Alert.alert('Error', 'Completa nombre y email')
        return
      }

      if (!editingUser && !formData.password) {
        Alert.alert('Error', 'La contraseña es obligatoria para nuevos usuarios')
        return
      }

      const token = await getToken()
      if (!token) {
        router.replace('/login')
        return
      }

      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }

      if (formData.password) {
        userData.password = formData.password
      }

      if (editingUser) {
        const result = await updateUser(token, editingUser.id, userData)
        if (result.generatedPassword) {
          Alert.alert(
            'Usuario actualizado',
            `Contraseña generada: ${result.generatedPassword}\n\nGuarda esta contraseña, no se mostrará nuevamente.`
          )
        } else {
          Alert.alert('Éxito', 'Usuario actualizado correctamente')
        }
      } else {
        const result = await createUser(token, userData)
        if (result.generatedPassword) {
          Alert.alert(
            'Usuario creado',
            `Contraseña generada: ${result.generatedPassword}\n\nGuarda esta contraseña, no se mostrará nuevamente.`
          )
        } else {
          Alert.alert('Éxito', 'Usuario creado correctamente')
        }
      }

      setModalVisible(false)
      loadUsers()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al guardar usuario')
    }
  }

  async function handleDelete(user: User) {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar a "${user.name}"?\n\nEsta acción no se puede deshacer.`,
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
              
              await deleteUser(token, user.id)
              Alert.alert('Éxito', 'Usuario eliminado correctamente')
              loadUsers()
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al eliminar usuario')
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
          <Text style={styles.title}>Usuarios</Text>
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
        <Text style={styles.title}>Usuarios</Text>
        <Pressable onPress={openCreateModal} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={FalabellaColors.primary} />
        </Pressable>
      </View>

      {/* Búsqueda */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={FalabellaColors.textMuted} />
          <TextInput
            placeholder="Buscar usuarios..."
            placeholderTextColor={FalabellaColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadUsers}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userIcon}>
              <IconSymbol 
                name={item.role === 'ADMIN' ? 'person.badge.key.fill' : 'person.fill'} 
                size={24} 
                color={item.role === 'ADMIN' ? '#F57C00' : FalabellaColors.primary} 
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={[
                styles.roleBadge,
                { backgroundColor: item.role === 'ADMIN' ? '#FFF3E0' : '#E3F2FD' }
              ]}>
                <Text style={[
                  styles.roleText,
                  { color: item.role === 'ADMIN' ? '#F57C00' : '#1976D2' }
                ]}>
                  {item.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <Pressable onPress={() => openEditModal(item)} style={styles.editButton}>
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionButtonText}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} style={styles.deleteButton}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="person.2" size={64} color={FalabellaColors.textMuted} />
            <Text style={styles.emptyText}>No hay usuarios</Text>
          </View>
        }
      />

      {/* Modal de crear/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={FalabellaColors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor={FalabellaColors.textMuted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                placeholder="usuario@email.com"
                placeholderTextColor={FalabellaColors.textMuted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={styles.label}>
                Contraseña {editingUser ? '(dejar vacío para mantener)' : '*'}
              </Text>
              <TextInput
                placeholder={editingUser ? 'Nueva contraseña' : 'Contraseña'}
                placeholderTextColor={FalabellaColors.textMuted}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                style={styles.input}
              />

              <Text style={styles.label}>Rol *</Text>
              <View style={styles.roleContainer}>
                <Pressable
                  onPress={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                  style={[
                    styles.roleOption,
                    formData.role === 'CUSTOMER' && styles.roleOptionSelected
                  ]}
                >
                  <IconSymbol 
                    name="person.fill" 
                    size={24} 
                    color={formData.role === 'CUSTOMER' ? FalabellaColors.white : FalabellaColors.primary} 
                  />
                  <Text style={[
                    styles.roleOptionText,
                    formData.role === 'CUSTOMER' && styles.roleOptionTextSelected
                  ]}>
                    Cliente
                  </Text>
                  <Text style={[
                    styles.roleOptionDesc,
                    formData.role === 'CUSTOMER' && styles.roleOptionDescSelected
                  ]}>
                    Puede comprar productos
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setFormData({ ...formData, role: 'ADMIN' })}
                  style={[
                    styles.roleOption,
                    formData.role === 'ADMIN' && styles.roleOptionSelected
                  ]}
                >
                  <IconSymbol 
                    name="person.badge.key.fill" 
                    size={24} 
                    color={formData.role === 'ADMIN' ? FalabellaColors.white : '#F57C00'} 
                  />
                  <Text style={[
                    styles.roleOptionText,
                    formData.role === 'ADMIN' && styles.roleOptionTextSelected
                  ]}>
                    Administrador
                  </Text>
                  <Text style={[
                    styles.roleOptionDesc,
                    formData.role === 'ADMIN' && styles.roleOptionDescSelected
                  ]}>
                    Acceso completo al sistema
                  </Text>
                </Pressable>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Guardar</Text>
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
  toolbar: {
    padding: 16,
    backgroundColor: FalabellaColors.white,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FalabellaColors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: FalabellaColors.text,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
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
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FalabellaColors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: FalabellaColors.text,
  },
  userEmail: {
    fontSize: 13,
    color: FalabellaColors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userActions: {
    gap: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: FalabellaColors.primary,
    gap: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: FalabellaColors.error,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: FalabellaColors.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FalabellaColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: FalabellaColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: FalabellaColors.text,
    backgroundColor: FalabellaColors.white,
  },
  roleContainer: {
    gap: 12,
    marginTop: 8,
  },
  roleOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: FalabellaColors.primary,
    backgroundColor: FalabellaColors.primary,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginTop: 8,
  },
  roleOptionTextSelected: {
    color: FalabellaColors.white,
  },
  roleOptionDesc: {
    fontSize: 13,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  roleOptionDescSelected: {
    color: FalabellaColors.white,
    opacity: 0.9,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: FalabellaColors.border,
    backgroundColor: FalabellaColors.white,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: FalabellaColors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: FalabellaColors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: FalabellaColors.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.white,
  },
})
