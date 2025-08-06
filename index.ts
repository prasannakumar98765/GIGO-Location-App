import { registerRootComponent } from 'expo';
import BackgroundGeolocation from 'react-native-background-geolocation';

import App from './App';
BackgroundGeolocation.registerHeadlessTask(async (event) => {
  console.log('[Headless Task]', event.name, event.params);

  if (event.name === 'location') {
    const location = event.params;
    // You can send location to your server or save it
    console.log('Headless location:', location);
  }
});
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
