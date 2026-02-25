import { View, TouchableOpacity, Image, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

type NavBarProps = {
  active: Number
}
function NavBar(props:NavBarProps){
  const button = {
    padding: 10,
    borderRadius: "50%"
  }
  const activeButton = {
    ...button,
    backgroundColor: "#aaaaff"
  }
  const navigation = useNavigation()
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
      backgroundColor: "white"
    }}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Dues", {})
        }}
        style={props.active === 1 ? activeButton : button}>
        <Image
          source={require("../assets/images/dues.png")}/>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Home", {})
        }}
        style={props.active === 2 ? activeButton : button}>
        <Image
          source={require("../assets/images/home.png")}/>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Profile", {})
        }}
        style={props.active === 3 ? activeButton : button}>
        <Image
          source={require("../assets/images/profile.png")}/>
      </TouchableOpacity>
    </View>
  )
}
export default NavBar