import { TextInput, View, Button, Text } from "react-native";

function Password(){
  return (
    <View style={{flex:1, justifyContent:"center"}}>
      <View>
        <Text>SAP ID</Text>
        <TextInput placeholder="SAP ID..."/>
        <Text>Password</Text>
        <TextInput placeholder="Password..."/>
        <Button title="Login"/>
      </View>
    </View>
  )
}
export default Password