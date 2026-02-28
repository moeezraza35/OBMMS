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
import Passsword from './src/pages/password';

const headerOpt = {
  header: () => <Header/>
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: Home,
      options: headerOpt
    },
    Profile: {
      screen: Profile,
      options: headerOpt
    },
    Dues: {
      screen: Dues,
      options: headerOpt
    },
    Notifications: {
      screen: Notifications,
      options: headerOpt
    },
    Login: {
      screen: Login,
      options: headerOpt
    },
    Passsword: {
      screen: Passsword,
      options: headerOpt
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
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Navigation ref={navigationRef} />
        </AuthProvider>
      </LoadingProvider>
    </SafeAreaProvider>
  );
}
export default App;
