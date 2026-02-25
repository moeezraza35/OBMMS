import {View, Text, Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

function Header(){
  const navigation = useNavigation();
  return (
    <View style={{
      backgroundColor: "white",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingInline: 10
    }}>
      <Image
        source={require("../assets/images/riphah-title.png")}
        style={{height: 50, width: 150}}
        resizeMode='contain'/>
      <TouchableOpacity onPress={() => {
        navigation.navigate("Notifications");
      }}>
        <Image
          source={require("../assets/images/bell.png")}/>
      </TouchableOpacity>
    </View>
  );
}
export default Header;