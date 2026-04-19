import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import NavBar from '../components/navbar';
import { textColor } from '../config';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';
import { LoadingContext } from '../context/loading';
import { makeRequest } from '../utils/request';

function Schedule() {
  const [routes, setRoutes] = useState<Array<any>>([])
  const [stops, setStops] = useState<Array<any>>([])
  const [buses, setBuses] = useState<Array<any>>([])
  const [search, setSearch] = useState("")
  const { session_id, user } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const loadData = async () => {
    setLoading(true)
    await makeRequest(
      "tracking/routes/",
      "GET",
      session_id,
      null,
      (data:{routes:Array<object>}) => setRoutes(data.routes),
      null
    )
    await makeRequest(
      "tracking/buses/",
      "GET",
      session_id,
      null,
      (data:{buses:Array<object>}) => setBuses(data.buses),
      null
    )
    await makeRequest(
      "tracking/stops/",
      "GET",
      session_id,
      null,
      (data:{stops:Array<object>}) => setStops(data.stops),
      null
    )
    setLoading(false)
  }
  useEffect(() => {
    if (user === null){
      navigate("Login")
    } else if (user.reset_required) {
      navigate("Password")
    }
    loadData()
  }, [])
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.nativeEvent.text)}
          placeholderTextColor={"#00000077"}
          placeholder="Search bus or route..." />
        {routes.filter(route => {
          const busLicense = buses.find(bus => bus.id === route.bus)?.license || "";
          const departureName = stops.find(stop => stop.id === route.departure)?.name || "";
          const destinationName = stops.find(stop => stop.id === route.destination)?.name || "";
          const searchLower = search.toLowerCase();
          return search === "" ||
            busLicense.toLowerCase().includes(searchLower) ||
            departureName.toLowerCase().includes(searchLower) ||
            destinationName.toLowerCase().includes(searchLower);
        }).map(route => (<View style={styles.card}>
          <Text style={styles.routeId}>{buses.find(bus => bus.id === route.bus)?.license}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Departure</Text>
            <Text style={styles.value}>{stops.find(stop => stop.id === route.departure)?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>{stops.find(stop => stop.id === route.destination)?.name}</Text>
          </View>
          <Text style={styles.time}>{route.time}</Text>
        </View>))}
      </ScrollView>
      <NavBar active={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: textColor,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  routeId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    color: '#1e293b',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 12,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default Schedule;