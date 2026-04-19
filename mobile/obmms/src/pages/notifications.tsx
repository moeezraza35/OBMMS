import { ScrollView, Text, View, StyleSheet } from 'react-native';
import NavBar from '../components/navbar';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';
import { NotificationContext } from '../context/notification';

function Notifications() {
  const { user } = useContext(AuthContext)
  const { notifications } = useContext(NotificationContext)
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
        {notifications.map(notifi => (
          <View style={styles.notificationBox}>
            <Text style={styles.notificationTitle}>{notifi.title}</Text>
            <Text style={styles.notificationMessage}>
              {notifi.body}
            </Text>
          </View>
        ))}
      </ScrollView>
      <NavBar active={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notificationBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
});

export default Notifications;