// screens/ExecutiveScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import socket from '../socket';

export default function ExecutiveScreen() {
  const [status, setStatus] = useState('⏳ Requesting permission...');

  useEffect(() => {
    const startTracking = async () => {
      const mongoId = await AsyncStorage.getItem('executiveMongoId');
      if (!mongoId) {
        setStatus('❌ No executive ID');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatus('❌ Permission denied');
        return;
      }

      setStatus('✅ Tracking started');

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          socket.emit('locationUpdate', {
            executiveId: mongoId,
            lat: latitude,
            lan: longitude,
          });
          console.log('📡 Sent location:', latitude, longitude);
        }
      );
    };

    startTracking();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📍 Executive Tracker</Text>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, fontWeight: 'bold' },
});
