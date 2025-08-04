// utils/backgroundLocation.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background task error:', error);
    return;
  }

  const locationData = data as { locations: Location.LocationObject[] };
  if (!locationData.locations || locationData.locations.length === 0) {
    console.log('⚠️ No location data received');
    return;
  }

  const { latitude, longitude } = locationData.locations[0].coords;
  const executiveMongoId = await AsyncStorage.getItem('executiveMongoId');

  if (!executiveMongoId) {
    console.warn('⚠️ Executive Mongo ID not found in storage');
    return;
  }

  const now = Date.now();
  const lastSent = await AsyncStorage.getItem('lastLocationSent');
  if (lastSent && now - parseInt(lastSent, 10) < 30000) {
    return;
  }
  await AsyncStorage.setItem('lastLocationSent', now.toString());

  try {
    await fetch('https://gigo-tracker.onrender.com/api/delivery/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executiveId: executiveMongoId,
        lat: latitude,
        lan: longitude,
      }),
    });

    if (__DEV__) {
      console.log('📍 Background location sent:', { latitude, longitude });
    }
  } catch (err: any) {
    console.error('❌ Failed to send background location:', err.message);
  }
});
