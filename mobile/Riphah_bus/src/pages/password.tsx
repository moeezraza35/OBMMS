import { TextInput, View, Button } from "react-native";

function Passsword(){
  return (
    <View style={{flex:1, justifyContent:"center"}}>
      <View>
        <TextInput placeholder="SAP ID..."/>
        <TextInput placeholder="Password..."/>
        <Button title="Login"/>
      </View>
    </View>
  )
}
export default Passsword