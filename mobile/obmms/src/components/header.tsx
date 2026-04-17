import { View, ViewStyle, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { accentColor } from '../config';

// Define your root stack parameter list (add all screens you use)
type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  // ... add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

function Header({ showBack = false, title = '' }: HeaderProps) {
  const navigation = useNavigation<NavigationProp>();

  const handleBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        ): ""}

      <View style={styles.centerSection}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Image
            source={require('../assets/images/title.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Image
            source={require('../assets/images/bell.png')}
            style={styles.bellIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: accentColor,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 3,
    alignItems: 'flex-start',
  },
  rightSection: {
    // flex: 1,
    backgroundColor: "#ffffff44",
    padding: 10,
    borderRadius: 15,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 28,
    color: '#2563eb',
    fontWeight: '600',
  },
  logo: {
    height: 44,
    width: 130,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  bellIcon: {
    height: 24,
    width: 24,
  },
});

export default Header;