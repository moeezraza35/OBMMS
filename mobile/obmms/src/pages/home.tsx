import { Text, View, Alert, Platform, PermissionsAndroid, StyleSheet, TouchableOpacity, InteractionManager } from 'react-native';
import { useContext, useEffect, useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { MRWSHandlerContext } from "mr-wshandler-react";
import { WebSocketContext } from '../context/websocket';
import { frontend, intervals } from '../config';
import Geolocation from "react-native-geolocation-service";
import NavBar from "../components/navbar";
import DropDown from '../components/dropdown';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';
import { LoadingContext } from '../context/loading';
import { makeRequest } from '../utils/request';

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
  locationInfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
  },
});

function Home() {
  const [error, setError] = useState("")
  const [granted, setGranted] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [buses, setBuses] = useState<Array<{id:number, name:string}>>([{id: 0, name: "Select Bus"}])
  const [selectedBus, setSelectedBus] = useState(0)
  const [location, setLocation] = useState<{
    latitude: number,
    longitude: number,
    accuracy: number,
    heading: number | null,
    speed: number | null
  }>({
    latitude: 0.0,
    longitude: 0.0,
    accuracy: 0,
    heading: null,
    speed: null,
  })
  const { send } = useContext(MRWSHandlerContext)
  const { status } = useContext(WebSocketContext)
  const { session_id, user } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)

  const LoadData = async () => {
    setLoading(true)
    await makeRequest(
      "tracking/buses/my/",
      "GET",
      session_id,
      null,
      (data:{buses: [{id:number, name:string}]}) => {setBuses([{id: 0, name: "Select Bus"}, ...data.buses])},
      null
    )
    setLoading(false)
  }

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      requestLocationPermission();
    });
    if (user === null) {
      navigate("Login")
    } else if (user.reset_required) {
      navigate("Password")
    }
    send?.(JSON.stringify({"session_id": session_id}))
    LoadData()
  }, []);

  // Send location via WebSocket whenever location changes
  useEffect(() => {
    if (sharing && selectedBus !== 0 && location.latitude !== 0 && location.longitude !== 0) {
      send?.(JSON.stringify({
        "type": "location",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "bus": selectedBus
      }));
    }
  }, [location, sharing, selectedBus, send]);

  // Manage interval for getting location
  useEffect(() => {
    if (sharing && granted) {
      // Start new interval
      setInterval(() => {
        getCurrentLocation();
      }, intervals);
    }
  }, [sharing, granted]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      setGranted(true);
      return;
    }
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
    if (!granted) {
      requestLocationPermission();
      return;
    }
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 10, flex: 1 }}>
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: frontend+'/map/' }}
            style={{ flex: 1 }}
            scrollEnabled={false}
          />
        </View>
        <View style={styles.controlsRow}>
          <DropDown
            list={buses}
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
              if (sharing && status) {
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

        {/* Display current location when sharing */}
        {sharing && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Accuracy: {location.accuracy.toFixed(1)}m
            </Text>
            {location.speed !== null && (
              <Text style={styles.locationText}>
                Speed: {(location.speed * 3.6).toFixed(1)} km/h
              </Text>
            )}
            {error !== "" && <Text style={[styles.locationText, { color: 'red' }]}>Error: {error}</Text>}
          </View>
        )}
      </View>
      <NavBar active={1} />
    </View>
  )
}

export default Home;