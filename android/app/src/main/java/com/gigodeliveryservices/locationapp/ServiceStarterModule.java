package com.gigodeliveryservices.locationapp;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ServiceStarterModule extends ReactContextBaseJavaModule {

    public ServiceStarterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ServiceStarter";
    }

    @ReactMethod
    public void startLocationService() {
        Intent intent = new Intent(getReactApplicationContext(), LocationService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getReactApplicationContext().startForegroundService(intent);
        } else {
            getReactApplicationContext().startService(intent);
        }
        Log.d("ServiceStarter", "Location service started");
    }
}
