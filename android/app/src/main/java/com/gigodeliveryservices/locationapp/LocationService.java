package com.gigodeliveryservices.locationapp;


import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.gigodeliveryservices.locationapp.R;
public class LocationService extends Service {
    private static final String CHANNEL_ID = "location_channel";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Location Tracking")
                .setContentText("Tracking your location in the background.")
                .setSmallIcon(R.mipmap.ic_launcher)
                .build();

        startForeground(1, notification);

        LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

        try {
            locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    60000, // 1 minute
                    10,    // 10 meters
                    new LocationListener() {
                        @Override
                        public void onLocationChanged(Location location) {
                            Log.d("LocationService", "Lat: " + location.getLatitude() + ", Lng: " + location.getLongitude());
                            // You can also send to server here.
                        }

                        @Override public void onStatusChanged(String s, int i, android.os.Bundle bundle) {}
                        @Override public void onProviderEnabled(String s) {}
                        @Override public void onProviderDisabled(String s) {}
                    });
        } catch (SecurityException e) {
            Log.e("LocationService", "Permission missing", e);
        }

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Location Tracking Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
