import { Redirect } from 'expo-router';
import { useApp } from '../context/AppContext';
import Spinner from '../components/Spinner';

export default function Index() {
  const { isAuthLoading, isLogin, userData } = useApp();

  if (isAuthLoading) return <Spinner fullScreen />;

  if (isLogin) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
