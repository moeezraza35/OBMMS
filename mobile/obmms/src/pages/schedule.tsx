import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import NavBar from '../components/navbar';
import { textColor } from '../config';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';

function Schedule() {
  const { user } = useContext(AuthContext)
  useEffect(() => {
    if (user === null){
      navigate("Login")
    } else if (user.reset_required) {
      navigate("Password")
    }
  }, [])
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TextInput style={styles.input} placeholderTextColor={"#00000077"} placeholder="Search bus or route..." />
        <View style={styles.card}>
          <Text style={styles.routeId}>LED-10-7958</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Departure</Text>
            <Text style={styles.value}>Stop 1</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Arrival</Text>
            <Text style={styles.value}>Stop 2</Text>
          </View>
          <Text style={styles.time}>10:00 pm</Text>
        </View>
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