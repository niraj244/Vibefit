import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postData, fetchData, BASE_URL } from '../utils/api';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';
import Spinner from '../components/Spinner';

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const { method, total, addressId } = useLocalSearchParams();
  const { cartData, userData, clearCart } = useApp();
  const [paypalUrl, setPaypalUrl] = useState(null);
  const [esewaUrl, setEsewaUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  const initPayment = async () => {
    if (method === 'paypal') {
      const res = await fetchData('/api/order/create-order-paypal');
      if (res?.approval_url) setPaypalUrl(res.approval_url);
      else Alert.alert('Error', 'Could not initiate PayPal payment');
    } else if (method === 'esewa') {
      const res = await postData('/api/order/initiate-esewa-payment', {
        amount: total,
        products: cartData.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        delivery_address: addressId,
      });
      if (res?.paymentUrl) setEsewaUrl(res.paymentUrl);
      else Alert.alert('Error', 'Could not initiate eSewa payment');
    }
    setLoading(false);
  };

  React.useEffect(() => { initPayment(); }, []);

  const handleNavigationChange = async (navState) => {
    const { url } = navState;

    // PayPal capture
    if (method === 'paypal' && url.includes('capture-order-paypal')) {
      const token = url.match(/[?&]token=([^&]+)/)?.[1];
      if (token) {
        const res = await postData('/api/order/capture-order-paypal', {
          orderID: token,
          products: cartData.map((i) => ({ ...i })),
          delivery_address: addressId,
          totalAmt: total,
          userId: userData?._id,
        });
        if (res?.error === false) {
          await clearCart(userData?._id);
          router.replace({ pathname: '/orders/success', params: { orderId: res.data?._id } });
        }
      }
    }

    // eSewa success callback
    if (method === 'esewa' && url.includes('/esewa-success')) {
      await clearCart(userData?._id);
      router.replace('/orders/success');
    }

    // Failure
    if (url.includes('esewa-failure') || url.includes('cancel=true') || url.includes('/order/failed')) {
      router.replace('/(tabs)/cart');
      Alert.alert('Payment Cancelled', 'Your payment was cancelled or failed.');
    }
  };

  const activeUrl = method === 'paypal' ? paypalUrl : esewaUrl;

  if (loading || !activeUrl) return <Spinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{method === 'paypal' ? 'PayPal Checkout' : 'eSewa Payment'}</Text>
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: activeUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => <Spinner fullScreen />}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  closeBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
});
