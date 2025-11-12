import { SafeAreaView, ScrollView, View, Platform } from 'react-native'

export default function Screen({ children, padded = true, center = false }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: padded ? 16 : 0,
          justifyContent: center ? 'center' : 'flex-start'
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ maxWidth: 520, alignSelf: 'center', width: '100%' }}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}