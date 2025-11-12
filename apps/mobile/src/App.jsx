import { useEffect, useState, useCallback } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, Button, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { getToken, getUser, setToken, setUser, clearToken, clearUser } from './lib/auth'
import { login, getOrdersAdmin, setOrderStatus } from './lib/api'
import Catalog from './screens/Catalog'
import ProductDetail from './screens/ProductDetail'
import Cart from './screens/Cart'
import MyOrders from './screens/MyOrders'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function LoginScreen({ onLoggedIn }) {
  const [email] = useState('admin@tienda.com')
  const [password] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const doLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await login(email, password)
      await setToken(data.token)
      await setUser(data.user)
      onLoggedIn(data.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Inicia sesión</Text>
      <Text style={{ color: '#666', marginBottom: 12 }}>Usando credenciales por defecto del seed</Text>
      {!!error && <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>}
      <Button title={loading ? 'Ingresando...' : 'Ingresar como Admin'} onPress={doLogin} disabled={loading} />
    </SafeAreaView>
  )
}

function AdminOrdersScreen({ token }) {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getOrdersAdmin(token, { page, limit })
      setOrders(data.orders || data.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, page, limit])

  useEffect(() => { load() }, [load])

  const onChangeStatus = async (id, status) => {
    try {
      await setOrderStatus(token, id, status)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!!error && <Text style={{ color: 'red', margin: 12 }}>{error}</Text>}
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>Orden #{item.id}</Text>
            <Text>Usuario: {item.user_id} · Total: ${item.total}</Text>
            <Text>Estado: {item.status}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {['PENDING','PAID','CANCELLED'].map(s => (
                <TouchableOpacity key={s} onPress={() => onChangeStatus(item.id, s)} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f0f0f0', borderRadius: 6, marginRight: 8 }}>
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>Órdenes (Admin)</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

function Placeholder({ title }) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18 }}>{title}</Text>
      <Text style={{ color: '#666' }}>Pronto...</Text>
    </SafeAreaView>
  )
}

function AdminTabs({ token, onLogout }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Órdenes" children={() => <AdminOrdersScreen token={token} />} />
      <Tab.Screen name="Productos" children={() => <Placeholder title="Productos (Admin)" />} />
      <Tab.Screen name="Categorías" children={() => <Placeholder title="Categorías (Admin)" />} />
      <Tab.Screen name="Cuenta" children={() => (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Cerrar sesión" onPress={onLogout} />
        </SafeAreaView>
      )} />
    </Tab.Navigator>
  )
}

function CustomerTabs({ onLogout }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [checkoutRequested, setCheckoutRequested] = useState(false)
  return (
    <Tab.Navigator>
      <Tab.Screen name="Catálogo" children={() => (
        selectedProduct ? (
          <ProductDetail productId={selectedProduct} onBack={() => setSelectedProduct(null)} />
        ) : (
          <Catalog onOpenProduct={(id) => setSelectedProduct(id)} />
        )
      )} />
      <Tab.Screen name="Carrito" children={() => (
        <Cart onCheckout={() => setCheckoutRequested(true)} />
      )} />
      <Tab.Screen name="Mis pedidos" component={MyOrders} />
      <Tab.Screen name="Cuenta" children={() => (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Cerrar sesión" onPress={onLogout} />
        </SafeAreaView>
      )} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [user, setUserState] = useState(null)
  const [token, setTokenState] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const t = await getToken()
      const u = await getUser()
      setTokenState(t)
      setUserState(u)
      setReady(true)
    })()
  }, [])

  const onLoggedIn = (u) => {
    getToken().then(t => setTokenState(t))
    setUserState(u)
  }

  const onLogout = async () => {
    await clearToken(); await clearUser();
    setTokenState(null); setUserState(null)
  }

  if (!ready) return <ActivityIndicator style={{ marginTop: 24 }} />

  return (
    <NavigationContainer>
      {!user || !token ? (
        <Stack.Navigator>
          <Stack.Screen name="Login" options={{ title: 'Login' }}>
            {() => <LoginScreen onLoggedIn={onLoggedIn} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : user.role === 'ADMIN' ? (
        <AdminTabs token={token} onLogout={onLogout} />
      ) : (
        <CustomerTabs onLogout={onLogout} />
      )}
    </NavigationContainer>
  )
}