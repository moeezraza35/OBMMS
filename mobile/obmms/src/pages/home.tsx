import { Text, View, Alert, Platform, PermissionsAndroid, StyleSheet, TouchableOpacity, InteractionManager } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { MRWSHandlerContext } from "mr-wshandler-react";
import { WebSocketContext } from '../context/websocket';
import { intervals } from '../config';
import Geolocation from "react-native-geolocation-service";
import NavBar from "../components/navbar";
import DropDown from '../components/dropdown';

const busOptions = [
  { id: 0, name: "Select Bus" },
  { id: 1, name: 'Bus 101 - LED-10-7958' },
  { id: 2, name: 'Bus 102 - LED-10-7959' },
  { id: 3, name: 'Bus 103 - LED-10-7960' },
];

const styles = StyleSheet.create({
  webviewContainer: {
    borderRadius: 10,
    flex: 1,
  },
  controlsRow: {
    gap: 10,
    zIndex: 999,
    elevation: 999,
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  dropdownButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    borderRadius: 12,
    height: 50,
  },
  customButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    color: '#fff',
    fontSize: 14,
  },
  dropdownRow: {
    backgroundColor: '#fff',
    borderBottomColor: '#ccc',
    height: 45,
  },
  rowText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  shareButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 160,
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

function Home() {
  const [error, setError] = useState("")
  const [granted, setGranted] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [selectedBus, setSelectedBus] = useState(0)
  const [location, setLocation] = useState<{
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    heading: Number|null,
    speed: Number|null
  }>({
    latitude: 0.0,
    longitude: 0.0,
    accuracy: 0,
    heading: null,
    speed: null,
  })
  const { send } = useContext(MRWSHandlerContext)
  const { status } = useContext(WebSocketContext)

  useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    requestLocationPermission();
  });
}, []);

  useEffect(() => {
    setTimeout(getCurrentLocation, intervals)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (sharing && granted) {
        getCurrentLocation();
      }
    }, intervals);
    return () => clearInterval(interval);
  }, [sharing, granted]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return;
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to track buses.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      )
      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        setGranted(true)
      } else {
        setError('Location permission denied');
        setGranted(false)
        setSharing(false)
        Alert.alert('Permission Required', 'Location access is needed to find nearby buses.', [{ text: 'OK' }]);
      }
    } catch (err) {
      Alert.alert('Failed to request permission')
      setGranted(false)
      setSharing(false)
    }
  };

  const getCurrentLocation = () => {
    if (!sharing) return
    if (!granted) requestLocationPermission()
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        })
        setError("")
      },
      (error) => {
        console.error('Location error:', error);
        setError(error.message);
        Alert.alert('Location Error', error.message || 'Failed to get your location', [{ text: 'OK' }]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white"}}>
      <View style={{ padding: 10, flex: 1 }}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: 'http://localhost:3000/map/' }}
            style={{ flex: 1 }}
            scrollEnabled={false}
          />
        </View>
        <View style={styles.controlsRow}>
          <DropDown
            list={busOptions}
            value={selectedBus}
            onSelect={(item) => setSelectedBus(item.id)}
            placeholder="Choose a bus"
          />
          <TouchableOpacity
            style={[
              styles.shareButton,
              sharing ? styles.stopButton : styles.startButton,
            ]}
            onPress={() => {
              if (sharing) {
                send?.(JSON.stringify({ type: "bus stop", bus: selectedBus ?? 1 }));
              }
              setSharing(!sharing);
            }}
            activeOpacity={0.8}>
            <Text style={styles.shareButtonText}>
              {sharing ? "Stop Sharing" : "Share Location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <NavBar active={1} />
    </View>
  )
}

export default Home;