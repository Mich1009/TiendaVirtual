import { View, Text, TextInput } from 'react-native'

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, inputMode, autoCapitalize = 'none' }) {
  return (
    <View style={{ marginTop: 12 }}>
      {label ? <Text style={{ color: '#555', fontSize: 14 }}>{label}</Text> : null}
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginTop: 6, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff' }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}