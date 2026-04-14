import { ScrollView, Text, View, Alert, Platform, PermissionsAndroid, Button } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { MRWSHandlerContext } from "mr-wshandler-react"
import { intervals } from '../config';
import Geolocation from "react-native-geolocation-service"
import NavBar from "../components/navbar"
import { WebSocketContext } from '../context/websocket';

function Home() {
  const [error, setError] = useState("")
  const [granted, setGranted] = useState(false)
  const [sharing, setSharing] = useState(false)
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
    requestLocationPermission()
  }, []);
  useEffect(() => {
    setTimeout(getCurrentLocation, intervals)
  })
  useEffect(() => {
    if (!send) return
    if (!sharing) return
    if (!status) return
    console.log("Sending location") // Debug print
    send(JSON.stringify({
      type: "location",
      bus: 1,
      latitude: location.latitude,
      longitude: location.longitude,
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
      setError('Failed to request permission')
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
          heading: position.coords.heading,
          speed: position.coords.speed
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
    )
  }
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <View style={{height: 500, width: "100%", position: "absolute", top: 0, zIndex: 1}}>
        <WebView source={{ uri: 'http://localhost:3000/map/' }} style={{ flex: 1, borderBottomWidth: 1 }}/>
      </View>
      <ScrollView style={{flex:1}}>
        <View style={{backgroundColor: "#fefefe", height: 500, marginTop: 500, zIndex:10}}>
          <View style={{
            padding: 3,
            backgroundColor: "gray",
            width: 100,
            marginHorizontal: "auto",
            marginVertical: 10,
            borderRadius: 3}}></View>
          <View style={{padding: 10}}>
            <Button
              title={sharing?"Stop Sharing":"Share Location"}
              onPress={() => {
                if (sharing){
                  send?send(JSON.stringify({
                    type: "bus stop",
                    bus: 1
                  })):""
                }
                setSharing(!sharing)
              }}/>
            <Text>Latitude: {""+location.latitude}</Text>
            <Text>Longitude: {""+location.longitude}</Text>
            <Text>Accuracy: {""+location.accuracy}</Text>
            <Text>Heading: {""+location.heading}</Text>
            <Text>Speed: {""+location.speed}</Text>
            <Text>Error: {error}</Text>
          </View>
        </View>
      </ScrollView>
      <NavBar active={2}/>
    </View>
  )
}
export default Home;