import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [executiveId, setExecutiveId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!executiveId) {
      Alert.alert('Please enter your Executive ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://gigo-tracker.onrender.com/api/delivery/executives/${executiveId}`
      );

      if (!response.ok) {
        throw new Error('Executive not found');
      }

      const executive = await response.json();

      if (!executive.role) {
        throw new Error('Invalid role in user data');
      }

      await AsyncStorage.setItem('executiveMongoId', executive._id);
      await AsyncStorage.setItem('executiveId', executive.executive_id.toString());
      await AsyncStorage.setItem('role', executive.role);

      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Executive ID"
        keyboardType="numeric"
        value={executiveId}
        onChangeText={setExecutiveId}
        autoCapitalize="none"
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', padding: 20, gap: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
});
