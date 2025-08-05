// screens/AdminScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Platform,
} from 'react-native';

import {
  MapView,
  Camera,
  MarkerView,
  requestAndroidLocationPermissions,
} from '@maplibre/maplibre-react-native';

import socket from '../socket';

interface Executive {
  _id: string;
  name: string;
  status: string;
  currentLocation?: {
    lat: number;
    lan: number;
  };
}

export default function AdminScreen() {
  const [executives, setExecutives] = useState<Record<string, Executive>>({});
  const [markerCoords, setMarkerCoords] = useState<Record<string, [number, number]>>({});
  const animatedCoords = useRef<Record<string, Animated.ValueXY>>({}).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestAndroidLocationPermissions();
    }

    fetch('https://gigo-tracker.onrender.com/api/delivery/executives')
      .then((res) => res.json())
      .then((data: Executive[]) => {
        const execMap: Record<string, Executive> = {};
        const coordMap: Record<string, [number, number]> = {};

        data.forEach((exec) => {
          if (exec.currentLocation) {
            console.log(
              `[API] ${exec.name}: lat=${exec.currentLocation.lat}, lan=${exec.currentLocation.lan}`
            );

            animatedCoords[exec._id] = new Animated.ValueXY({
              x: exec.currentLocation.lan,
              y: exec.currentLocation.lat,
            });

            coordMap[exec._id] = [
              exec.currentLocation.lan,
              exec.currentLocation.lat,
            ];
          }

          execMap[exec._id] = exec;
        });

        setExecutives(execMap);
        setMarkerCoords(coordMap);
      })
      .catch((error) => {
        console.error('Failed to fetch executives:', error);
      });

    const handleUpdate = (data: {
      executiveId: string;
      lat: number;
      lan: number;
    }) => {
      console.log(
        `[SOCKET] executiveId=${data.executiveId}, lat=${data.lat}, lan=${data.lan}`
      );

      setExecutives((prev) => ({
        ...prev,
        [data.executiveId]: {
          ...prev[data.executiveId],
          currentLocation: { lat: data.lat, lan: data.lan },
        },
      }));

      if (!animatedCoords[data.executiveId]) {
        animatedCoords[data.executiveId] = new Animated.ValueXY({
          x: data.lan,
          y: data.lat,
        });

        setMarkerCoords((prev) => ({
          ...prev,
          [data.executiveId]: [data.lan, data.lat],
        }));
      } else {
        Animated.timing(animatedCoords[data.executiveId], {
          toValue: { x: data.lan, y: data.lat },
          duration: 1000,
          useNativeDriver: false,
        }).start();

        setMarkerCoords((prev) => ({
          ...prev,
          [data.executiveId]: [data.lan, data.lat],
        }));
      }
    };

    socket.on('executiveLocationUpdated', handleUpdate);
    return () => {
      socket.off('executiveLocationUpdated', handleUpdate);
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=dBKxeA01UYC6scsnashk"
      >
        <Camera
          zoomLevel={5}
          centerCoordinate={[78.9629, 20.5937]} // India center
        />

        {Object.values(executives).map((exec) => {
          const coord = markerCoords[exec._id];
          if (!exec.currentLocation || !coord) return null;

          return (
            <MarkerView key={exec._id} coordinate={coord}>
              <Animated.View style={styles.annotationContainer}>
                <View style={styles.marker} />
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{exec.name}</Text>
                </View>
              </Animated.View>
            </MarkerView>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  annotationContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },
  labelContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  label: {
    fontSize: 10,
    color: 'black',
  },
});
