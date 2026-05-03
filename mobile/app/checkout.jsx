import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData, postData } from '../utils/api';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline', desc: 'Pay when your order arrives' },
  { id: 'paypal', label: 'PayPal', icon: 'card-outline', desc: 'Secure international payment' },
  { id: 'esewa', label: 'eSewa', icon: 'phone-portrait-outline', desc: 'Nepal digital wallet' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartData, cartTotal, userData, clearCart } = useApp();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const finalTotal = couponData ? couponData.finalAmount : cartTotal;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetchData(
        `/api/coupon/validate?code=${encodeURIComponent(couponInput.trim().toUpperCase())}&userId=${userData?._id}&totalAmount=${cartTotal}`
      );
      if (res?.valid) {
        setCouponData(res.coupon);
        Alert.alert('Coupon Applied!', `You save Rs. ${res.coupon.discount.toLocaleString()}`);
      } else {
        setCouponData(null);
        Alert.alert('Invalid Coupon', res?.message || 'Coupon not valid');
      }
    } catch {
      Alert.alert('Error', 'Could not validate coupon');
    }
    setCouponLoading(false);
  };

  useEffect(() => {
    fetchData('/api/address/get').then((res) => {
      const list = res?.data || [];
      setAddresses(list);
      const def = list.find((a) => a.selected) || list[0];
      if (def) setSelectedAddr(def);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePlaceOrder = async () => {
    if (cartTotal < 1000) { Alert.alert('Minimum Order', 'Minimum order amount is Rs. 1,000. Add more items to proceed.'); return; }
    if (!selectedAddr) { Alert.alert('Select an address', 'Please select a delivery address.'); return; }
    if (cartData.length === 0) { Alert.alert('Cart empty'); return; }

    if (payMethod === 'paypal') {
      router.push({ pathname: '/payment-webview', params: { method: 'paypal', total: finalTotal, addressId: selectedAddr._id } });
      return;
    }
    if (payMethod === 'esewa') {
      router.push({ pathname: '/payment-webview', params: { method: 'esewa', total: finalTotal, addressId: selectedAddr._id, couponCode: couponData?.code || '', couponDiscount: couponData?.discount || 0 } });
      return;
    }

    // COD
    setPlacing(true);
    try {
      const orderPayload = {
        products: cartData.map((item) => ({
          productId: item.productId,
          productTitle: item.productTitle,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          size: item.size || '',
          subTotal: item.subTotal,
          brand: item.brand || '',
          countInStock: item.countInStock,
          discount: item.discount || 0,
        })),
        totalAmt: finalTotal,
        couponCode: couponData?.code || '',
        couponDiscount: couponData?.discount || 0,
        delivery_address: selectedAddr._id,
        paymentId: `COD_${Date.now()}`,
        payment_status: 'pending',
        userId: userData?._id,
      };
      const res = await postData('/api/order/create', orderPayload);
      if (res?.error === false) {
        await clearCart(userData?._id);
        router.replace({ pathname: '/orders/success', params: { orderId: res.data?._id } });
      } else {
        Alert.alert('Order Failed', res?.message || 'Something went wrong');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {addresses.length === 0 ? (
          <TouchableOpacity style={styles.addAddrBtn} onPress={() => router.push('/address/add')}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.addAddrText}>Add a delivery address</Text>
          </TouchableOpacity>
        ) : (
          <>
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr._id}
                style={[styles.addrCard, selectedAddr?._id === addr._id && styles.addrCardActive]}
                onPress={() => setSelectedAddr(addr)}
              >
                <View style={styles.addrRadio}>
                  {selectedAddr?._id === addr._id && <View style={styles.addrRadioFill} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrType}>{addr.addressType} · {addr.mobile}</Text>
                  <Text style={styles.addrLine}>{addr.address_line1}</Text>
                  <Text style={styles.addrLine}>{addr.city}, {addr.state}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => router.push('/address/add')} style={styles.addMoreAddr}>
              <Ionicons name="add" size={16} color={COLORS.primary} />
              <Text style={styles.addAddrText}>Add another address</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Payment */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, payMethod === method.id && styles.methodCardActive]}
            onPress={() => setPayMethod(method.id)}
          >
            <View style={styles.addrRadio}>
              {payMethod === method.id && <View style={styles.addrRadioFill} />}
            </View>
            <Ionicons name={method.icon} size={22} color={payMethod === method.id ? COLORS.primary : COLORS.textMuted} style={{ marginRight: 12 }} />
            <View>
              <Text style={[styles.methodLabel, payMethod === method.id && { color: COLORS.primary }]}>{method.label}</Text>
              <Text style={styles.methodDesc}>{method.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Order Summary */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Order Summary</Text>
        <View style={styles.summaryCard}>
          {cartData.map((item) => (
            <View key={item._id} style={styles.summaryItem}>
              <Text style={styles.summaryName} numberOfLines={1}>{item.productTitle}</Text>
              <Text style={styles.summaryQty}>×{item.quantity}</Text>
              <Text style={styles.summaryPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          {couponData && (
            <>
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 13, color: COLORS.textMuted }}>Subtotal</Text>
                <Text style={{ fontSize: 13, color: COLORS.textMuted }}>Rs. {cartTotal.toLocaleString()}</Text>
              </View>
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '700' }}>Coupon ({couponData.code})</Text>
                <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '700' }}>− Rs. {couponData.discount.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {finalTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Coupon */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Have a Coupon?</Text>
        {couponData ? (
          <View style={styles.couponApplied}>
            <View>
              <Text style={styles.couponCode}>{couponData.code}</Text>
              <Text style={styles.couponSaving}>
                {couponData.type === 'flat' ? `Rs. ${couponData.discount.toLocaleString()} off` : `${couponData.value}% off`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setCouponData(null); setCouponInput(''); }}>
              <Text style={styles.couponRemove}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              value={couponInput}
              onChangeText={(t) => setCouponInput(t.toUpperCase())}
              placeholder="Enter coupon code"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.couponBtn, (!couponInput.trim() || couponLoading) && { opacity: 0.5 }]}
              onPress={handleApplyCoupon}
              disabled={!couponInput.trim() || couponLoading}
            >
              <Text style={styles.couponBtnText}>{couponLoading ? '...' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartTotal < 1000 && (
        <View style={styles.minOrderBanner}>
          <Text style={styles.minOrderText}>Minimum order: Rs. 1,000 (Rs. {(1000 - cartTotal).toLocaleString()} more needed)</Text>
        </View>
      )}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerTotal}>Rs. {finalTotal.toLocaleString()}</Text>
        </View>
        <Button title={placing ? 'Placing...' : `Place Order`} onPress={handlePlaceOrder} loading={placing} style={styles.placeBtn} disabled={cartTotal < 1000} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', gap: 12 },
  backBtn: { padding: 2 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  content: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  addAddrBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 10, padding: 14 },
  addMoreAddr: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  addAddrText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  addrCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border },
  addrCardActive: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  addrRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  addrRadioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addrType: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  addrLine: { fontSize: 13, color: COLORS.textLight },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border },
  methodCardActive: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  methodLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  methodDesc: { fontSize: 12, color: COLORS.textMuted },
  summaryCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryName: { flex: 1, fontSize: 13, color: COLORS.text },
  summaryQty: { fontSize: 13, color: COLORS.textMuted, marginHorizontal: 8 },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  couponRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  couponInput: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.text, backgroundColor: '#fff', letterSpacing: 1 },
  couponBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  couponBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  couponApplied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#86efac', borderRadius: 10, padding: 12, marginBottom: 8 },
  couponCode: { fontSize: 14, fontWeight: '800', color: '#166534', letterSpacing: 1 },
  couponSaving: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  couponRemove: { fontSize: 13, color: '#ef4444', fontWeight: '700' },
  minOrderBanner: { backgroundColor: '#fef2f2', borderTopWidth: 1, borderTopColor: '#fecaca', paddingHorizontal: 16, paddingVertical: 8 },
  minOrderText: { fontSize: 12, color: '#dc2626', textAlign: 'center', fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  footerLabel: { fontSize: 12, color: COLORS.textMuted },
  footerTotal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  placeBtn: { flex: 1, marginLeft: 16 },
});
