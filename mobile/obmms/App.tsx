import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {createStaticNavigation} from '@react-navigation/native';
import { navigationRef } from './src/utils/navigation';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { LoadingProvider } from './src/context/loading';
import { AuthProvider } from './src/context/auth';
import Home from './src/pages/home';
import Profile from './src/pages/profile';
import Dues from './src/pages/dues';
import Notifications from './src/pages/notifications';
import Header from './src/components/header';
import Login from './src/pages/login';
import Password from './src/pages/password';
import { WebSocketProvider } from './src/context/websocket';
import Schedule from './src/pages/schedule';

const headerOpt = {
  header: () => <Header/>
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {header: () => <Header/>}
    },
    Profile: {
      screen: Profile,
      options: {header: () => <Header title='My Profile' showBack/>}
    },
    Dues: {
      screen: Dues,
      options: {header: () => <Header title='Bus Fee & Dues' showBack/>}
    },
    Schedule: {
      screen: Schedule,
      options: {header: () => <Header title='Schedule' showBack/>}
    },
    Notifications: {
      screen: Notifications,
      options: {header: () => <Header title='Notifications' showBack/>}
    },
    Login: {
      screen: Login,
      options: {header: () => <Header title='Login'/>}
    },
    Password: {
      screen: Password,
      options: {header: () => <Header title='Reset Password'/>}
    }
  },
});

const Navigation = createStaticNavigation(RootStack);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <LoadingProvider>
        <AuthProvider>
          <WebSocketProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Navigation ref={navigationRef} />
          </WebSocketProvider>
        </AuthProvider>
      </LoadingProvider>
    </SafeAreaProvider>
  );
}
export default App;
