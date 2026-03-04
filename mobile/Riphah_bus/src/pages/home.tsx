import { ScrollView, Text, View, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from "react-native-geolocation-service"
import NavBar from "../components/navbar"
import { useContext, useEffect, useState } from 'react';
import { LoadingContext } from '../context/loading';

function Home() {
  const [error, setError] = useState("")
  const [location, setLocation] = useState({
    latitude: 0.0,
    longitude: 0.0,
    accuracy: 0
  })
  const {setLoading} = useContext(LoadingContext)
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Request permission based on platform
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // iOS handles permissions differently
      getCurrentLocation();
      return;
    }

    // Android permission request
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to track buses.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        getCurrentLocation();
      } else {
        setError('Location permission denied');
        setLoading(false);
        Alert.alert(
          'Permission Required',
          'Location access is needed to find nearby buses. Please enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.warn(err);
      setError('Failed to request permission');
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setError("");
      },
      (error) => {
        console.log('Location error:', error);
        setError(error.message);
        setLoading(false);
        
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