import { ScrollView, Text, View, Alert, Platform, PermissionsAndroid, Button } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { WebSocketContext } from '../context/websocket';
import Geolocation from "react-native-geolocation-service"
import NavBar from "../components/navbar"

function Home() {
  const [error, setError] = useState("")
  const [granted, setGranted] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [location, setLocation] = useState({
    latitude: 0.0,
    longitude: 0.0,
    accuracy: 0
  })
  const {ws} = useContext(WebSocketContext)
  useEffect(() => {
    requestLocationPermission()
  }, []);
  useEffect(() => {
    setTimeout(getCurrentLocation, 5000)
  })
  useEffect(() => {
    if (!ws) return
    if (!sharing) return
    ws.send(JSON.stringify({
      type: "location",
      bus: 1,
      latitude: location.latitude,
      longitude: location.longitude
    }))
  }, [location])
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return;

    // Android permission request
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
        Alert.alert(
          'Permission Required',
          'Location access is needed to find nearby buses. Please enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error(err);
      setError('Failed to request permission');
      setGranted(false)
      setSharing(false)
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!sharing) return
    if (!granted){
      requestLocationPermission()
    }
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setError("")
      },
      (error) => {
        console.error('Location error:', error);
        setError(error.message);
        
        Alert.alert(
          'Location Error',
          error.message || 'Failed to get your location',
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <View style={{height: 500}}>
          <WebView source={{ uri: 'http://localhost:3000/map/' }} style={{ flex: 1, borderBottomWidth: 1 }}/>
        </View>
        <View style={{backgroundColor: "#fefefe", height: 500}}>
          <View style={{
            padding: 3,
            backgroundColor: "gray",
            width: 100,
            marginHorizontal: "auto",
            marginVertical: 10,
            borderRadius: 3}}></View>
          <View>
            <Button
              title={sharing?"Stop Sharing":"Share Location"}
              onPress={() => {
                if (sharing){
                  ws?.send(JSON.stringify({
                    type: "bus stop",
                    bus: 1
                  }))
                }
                setSharing(!sharing)
              }}/>
            <Text>Latitude: {location.latitude}</Text>
            <Text>Longitude: {location.longitude}</Text>
            <Text>Accuracy: {location.accuracy}</Text>
            <Text>Error: {error}</Text>
          </View>
        </View>
      </ScrollView>
      <NavBar active={2}/>
    </View>
  )
}
export default Home;