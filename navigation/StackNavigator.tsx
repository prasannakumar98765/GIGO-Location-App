//navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminScreen from '../screens/AdminScreen';
import ExecutiveScreen from '../screens/ExecutiveScreen';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Admin: undefined;
  Executive: { eid: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Executive" component={ExecutiveScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;


// // navigation/StackNavigator.tsx
// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from '../screens/LoginScreen';
// import HomeScreen from '../screens/HomeScreen';
// import ExecutiveScreen from '../screens/ExecutiveScreen';
// import AdminScreen from '../screens/AdminScreen';

// export type RootStackParamList = {
//   Login: undefined;
//   Home: undefined;
//   Executive: { eid: string };
//   Admin: undefined;
// };

// const Stack = createStackNavigator<RootStackParamList>();

// export default function StackNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Home" component={HomeScreen} />
//       <Stack.Screen name="Executive" component={ExecutiveScreen} />
//       <Stack.Screen name="Admin" component={AdminScreen} />
//     </Stack.Navigator>
//   );
// }
