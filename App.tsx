// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/StackNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import axios from 'axios';

// ✅ Backend server
const BACKEND_URL = 'https://gigo-tracker.onrender.com';
const socket = io(BACKEND_URL, {
  transports: ['websocket'], // ✅ Render sometimes blocks polling
});

export default function App() {
  const [executiveId, setExecutiveId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await requestPermissions();
      await fetchAndSetExecutiveId();
    };

    init();

    return () => {
      socket.disconnect(); // ✅ clean socket connection
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);

      const allGranted = Object.values(granted).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert('Permissions required', 'Location permissions are required for tracking.');
      }
    }
  };

  const fetchAndSetExecutiveId = async () => {
    try {
      const storedExecCode = await AsyncStorage.getItem('executive_code');
      if (!storedExecCode) {
        console.warn('⚠️ No executive_code found in storage');
        return;
      }

      const res = await axios.get(`${BACKEND_URL}/api/delivery/executives/${storedExecCode}`);
      const exec = res.data;
      if (exec && exec._id) {
        setExecutiveId(exec._id);
        console.log('✅ Executive ID:', exec._id);
        setupBackgroundGeolocation(exec._id); // ✅ only set up tracking after ID is fetched
      }
    } catch (err) {
      console.error('❌ Failed to fetch executive:', err.message);
    }
  };

  const setupBackgroundGeolocation = (execId: string) => {
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      debug: false,
      foregroundService: true,
      notification: {
        title: 'GIGO Delivery Tracker',
        text: 'Tracking location in background',
      },
    }, (state) => {
      if (!state.enabled) {
        BackgroundGeolocation.start();
      }
    });

    BackgroundGeolocation.onLocation(location => {
      const coords = location?.coords;
      if (!coords || !execId) return;

      socket.emit('locationUpdate', {
        executiveId: execId,
        lat: coords.latitude,
        lan: coords.longitude,
      });

      console.log('📡 Location Sent:', {
        executiveId: execId,
        lat: coords.latitude,
        lan: coords.longitude,
      });
    });

    BackgroundGeolocation.onMotionChange(event => {
      console.log('[MotionChange]', event.isMoving, event.location);
    });

    BackgroundGeolocation.onProviderChange(provider => {
      console.log('[ProviderChange]', provider.enabled, provider.status);
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
