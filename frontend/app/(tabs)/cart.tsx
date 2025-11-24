import { useMemo } from 'react'
import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useCart } from '@/context/CartContext'
import { FalabellaColors } from '@/constants/theme'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function CarritoScreen() {
  const router = useRouter()
  const { items, updateQty, removeItem, total } = useCart()
  const empty = useMemo(() => items.length === 0, [items])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Carrito</Text>
        <Text style={styles.itemCount}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</Text>
      </View>

      {empty ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="cart" size={80} color={FalabellaColors.textMuted} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Agrega productos para comenzar tu compra</Text>
          <Pressable onPress={() => router.push('/(tabs)/catalog')} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Explorar productos</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                {item.img ? (
                  <Image source={{ uri: item.img }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage]} />
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>S/ {Number(item.price).toLocaleString('es-PE')}</Text>
                  
                  <View style={styles.quantityContainer}>
                    <Pressable 
                      onPress={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.quantityText}>{item.qty}</Text>
                    <Pressable 
                      onPress={() => updateQty(item.id, item.qty + 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
                  <IconSymbol name="trash" size={20} color={FalabellaColors.textMuted} />
                </Pressable>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>S/ {total.toLocaleString('es-PE')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryFree}>Gratis</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>S/ {total.toLocaleString('es-PE')}</Text>
            </View>
            <Pressable onPress={() => router.push('/checkout')} style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Continuar con la compra</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  header: {
    backgroundColor: FalabellaColors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FalabellaColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  itemCount: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FalabellaColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FalabellaColors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  shopButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: FalabellaColors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: FalabellaColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: FalabellaColors.backgroundGray,
  },
  placeholderImage: {
    backgroundColor: FalabellaColors.border,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.primary,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: FalabellaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FalabellaColors.primary,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.white,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: FalabellaColors.text,
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 24,
  },
  separator: {
    height: 12,
  },
  summaryContainer: {
    backgroundColor: FalabellaColors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: FalabellaColors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: FalabellaColors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.text,
  },
  summaryFree: {
    fontSize: 14,
    fontWeight: '500',
    color: FalabellaColors.success,
  },
  divider: {
    height: 1,
    backgroundColor: FalabellaColors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: FalabellaColors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: FalabellaColors.primary,
  },
  checkoutButton: {
    backgroundColor: FalabellaColors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: FalabellaColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
})