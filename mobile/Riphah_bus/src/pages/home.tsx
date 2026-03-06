import { ScrollView, Text, View, StyleSheet, Alert, Platform, PermissionsAndroid, Button } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
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
  useEffect(() => {
    requestLocationPermission();
  }, []);
  useEffect(() => {
    getCurrentLocation();
  })
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
        console.log('Location permission granted');
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
        console.log('Location obtained:', position)
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
              onPress={() => setSharing(!sharing)}/>
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