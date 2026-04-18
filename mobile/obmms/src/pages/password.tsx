import { TextInput, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { accentColor } from "../config"; // adjust path if needed

function Password() {
  return (
    <View style={styles.container}>
      {/* Top accent box with white circle and lock icon */}
      <View style={[styles.topBox, { backgroundColor: accentColor }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        <Text style={{ color: "white", marginTop: 10, fontSize: 25}}>Reset Password</Text>
      </View>

      {/* Floating card containing the password reset form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password..."
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password..."
          placeholderTextColor="#999"
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.resetButton, { backgroundColor: accentColor }]}>
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBox: {
    height: "40%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockIcon: {
    fontSize: 48,
  },
  formCard: {
    position: "absolute",
    top: "35%",
    left: "5%",
    right: "5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    marginTop: 10,
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Password;