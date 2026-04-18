import { ScrollView, Text, View, StyleSheet } from 'react-native';
import NavBar from '../components/navbar';

function Notifications() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.notificationBox}>
          <Text style={styles.notificationTitle}>Notification 1</Text>
          <Text style={styles.notificationMessage}>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores corporis provident quas? Vitae omnis fugit quae commodi maxime facilis, adipisci cupiditate veniam? Earum consectetur accusamus iusto nisi quo vel magnam!
          </Text>
        </View>
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