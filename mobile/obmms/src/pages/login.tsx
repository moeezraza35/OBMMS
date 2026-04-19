import { Text, TextInput, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../utils/request";
import { AuthContext } from "../context/auth";
import { navigate } from "../utils/navigation";
import { accentColor } from "../config"; // adjust path if needed
import { LoadingContext } from "../context/loading";

function Login() {
  const { user, setSessionId, require_auth } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext)
  const [formData, setFormData] = useState({
    sap: "",
    password: "",
  });
  useEffect(() => {
    if (user != null){
      if (user.reset_required) {
        navigate("Password")
      } else {
        navigate("Home")
      }
    } 
  }, [user])

  const handleLogin = async () => {
    setLoading(true)
    await makeRequest(
      "auth/login/",
      "POST",
      "",
      formData,
      async (data: { session_id: string }) => {
        setSessionId(data.session_id);
        await require_auth(data.session_id);
        navigate("Home");
      },
      (e: any) => {
        console.log(e);
      }
    );
    setLoading(false)
  };

  return (
    <View style={styles.container}>
      {/* Top accent box with white circle and logo */}
      <View style={[styles.topBox, { backgroundColor: accentColor }]}>
        <View style={styles.logoCircle}>
          <Image
            source={require("../assets/images/logo.png")} // adjust path to your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={{ color: "white", marginTop: 10, fontSize: 25}}>Welcome Back!</Text>
      </View>

      {/* Floating card containing the login form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>SAP ID:</Text>
        <TextInput
          style={styles.input}
          placeholder="SAP ID..."
          placeholderTextColor="#999"
          value={formData.sap}
          onChange={(e) =>
            setFormData({ ...formData, sap: e.nativeEvent.text })
          }
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password..."
          placeholderTextColor="#999"
          secureTextEntry
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.nativeEvent.text })
          }
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // white area below the accent box
  },
  topBox: {
    height: "45%", // top portion with accent color
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
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
  logo: {
    width: 60,
    height: 60,
  },
  formCard: {
    position: "absolute",
    top: "35%", // overlaps the boundary between topBox and white area
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
  loginButton: {
    backgroundColor: accentColor,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Login;