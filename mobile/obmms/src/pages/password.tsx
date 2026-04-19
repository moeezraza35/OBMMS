import { TextInput, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useContext, useState } from "react";
import { accentColor } from "../config";
import { LoadingContext } from "../context/loading";
import { makeRequest } from "../utils/request";
import { AuthContext } from "../context/auth";
import { navigate } from "../utils/navigation";

function Password() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const { setLoading } = useContext(LoadingContext)
  const { session_id, require_auth } = useContext(AuthContext)
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
          value={password}
          onChange={(e) => setPassword(e.nativeEvent.text)}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password..."
          placeholderTextColor="#999"
          secureTextEntry
          value={confirm}
          onChange={(e) => setConfirm(e.nativeEvent.text)}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: accentColor }]}
            onPress={async () => {
              if (password === "" || confirm === ""){
                Alert.alert("Missing Values!","Please fill out all the fields")
                return
              }
              if (password !== confirm){
                Alert.alert("Password Mismatch", "Password and confirm password doesn't match")
                return
              }
              setLoading(true)
              await makeRequest(
                "auth/change_password/",
                "POST",
                session_id,
                {"password": password},
                async () => {
                  await require_auth(session_id)
                  navigate("Home")
                },
                null
              )
              setLoading(false)
            }}>
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