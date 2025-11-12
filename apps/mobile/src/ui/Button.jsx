import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

export default function Button({ title, onPress, disabled, loading, variant = 'primary' }) {
  const bg = variant === 'primary' ? '#0b5fff' : variant === 'secondary' ? '#f0f0f0' : '#fff'
  const color = variant === 'primary' ? '#fff' : '#111'
  const border = variant === 'secondary' ? '#ddd' : 'transparent'
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: disabled ? '#9db8ff' : bg,
        borderWidth: variant === 'secondary' ? 1 : 0,
        borderColor: border,
        alignItems: 'center'
      }}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={{ color, fontWeight: '600' }}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}