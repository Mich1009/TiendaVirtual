import { useEffect, useState, useCallback } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import Screen from './ui/Screen'
import Input from './ui/Input'
import Btn from './ui/Button'
import { getToken, getUser, setToken, setUser, clearToken, clearUser } from './lib/auth'
import { login, getOrdersAdmin, setOrderStatus } from './lib/api'
import Register from './screens/Register'
import Recover from './screens/Recover'
import Account from './screens/Account'
import Catalog from './screens/Catalog'
import ProductDetail from './screens/ProductDetail'
import Cart from './screens/Cart'
import MyOrders from './screens/MyOrders'
import Checkout from './screens/Checkout'
import OrderConfirmation from './screens/OrderConfirmation'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function LoginScreen({ onLoggedIn, onGoRegister, onGoRecover }) {
  const [email, setEmail] = useState('admin@tienda.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const doLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await login(email, password)
      const token = data.accessToken || data.token
      if (!token) throw new Error('Token no recibido')
      await setToken(token)
      const user = data.user || { role: 'CUSTOMER' }
      await setUser(user)
      onLoggedIn(user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Screen center>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Bienvenido</Text>
      <Text style={{ color: '#666', marginTop: 6 }}>Inicia sesión para continuar.</Text>
      <Input label="Correo" value={email} onChangeText={setEmail} placeholder="you@example.com" inputMode="email" autoCapitalize="none" />
      <Input label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" />
      {!!error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}
      <View style={{ marginTop: 16 }}>
        <Btn title={loading ? 'Ingresando…' : 'Iniciar sesión'} onPress={doLogin} disabled={loading} loading={loading} />
      </View>
      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={onGoRecover}><Text style={{ color: '#1f7ae0', fontWeight: '600' }}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>
        <TouchableOpacity onPress={onGoRegister}><Text style={{ color: '#1f7ae0', fontWeight: '600' }}>Registrarse</Text></TouchableOpacity>
      </View>
    </Screen>
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
        <Screen center padded>
          <Btn title="Cerrar sesión" onPress={onLogout} />
        </Screen>
      )} />
    </Tab.Navigator>
  )
}

function CustomerTabs({ onLogout, token }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const CartStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="Cart" options={{ title: 'Carrito' }}>
        {({ navigation }) => (
          <Cart onCheckout={() => navigation.navigate('Checkout')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Checkout" options={{ title: 'Checkout' }} component={Checkout} />
      <Stack.Screen name="OrderConfirmation" options={{ title: 'Pedido confirmado' }} component={OrderConfirmation} />
    </Stack.Navigator>
  )
  return (
    <Tab.Navigator>
      <Tab.Screen name="Catálogo" children={() => (
        selectedProduct ? (
          <ProductDetail productId={selectedProduct} onBack={() => setSelectedProduct(null)} />
        ) : (
          <Catalog onOpenProduct={(id) => setSelectedProduct(id)} />
        )
      )} />
      <Tab.Screen name="Carrito" component={CartStack} />
      <Tab.Screen name="Mis pedidos" component={MyOrders} />
      <Tab.Screen name="Cuenta" children={() => (
        <Account token={token} onLogout={onLogout} />
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
            {({ navigation }) => (
              <LoginScreen
                onLoggedIn={onLoggedIn}
                onGoRegister={() => navigation.navigate('Register')}
                onGoRecover={() => navigation.navigate('Recover')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register" options={{ title: 'Registro' }} component={Register} />
          <Stack.Screen name="Recover" options={{ title: 'Recuperar contraseña' }} component={Recover} />
        </Stack.Navigator>
      ) : user.role === 'ADMIN' ? (
        <AdminTabs token={token} onLogout={onLogout} />
      ) : (
        <CustomerTabs token={token} onLogout={onLogout} />
      )}
    </NavigationContainer>
  )
}