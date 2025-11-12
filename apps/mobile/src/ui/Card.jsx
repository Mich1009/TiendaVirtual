import { View } from 'react-native'

export default function Card({ children }) {
  return (
    <View style={{ padding: 16, borderRadius: 12, backgroundColor: '#fff', borderColor: '#eee', borderWidth: 1 }}>
      {children}
    </View>
  )
}