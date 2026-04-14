import { Text, TextInput, View, Button } from "react-native";
import { useContext, useState } from "react";
import { makeRequest } from "../utils/request";
import { AuthContext } from "../context/auth";
import { navigate } from "../utils/navigation";

function Login(){
  const {setSessionId, require_auth} = useContext(AuthContext)
  const [formData, setFormData] = useState({
    sap: "",
    password: ""
  });
  const handleLogin = async () => {
    console.log(formData);
    await makeRequest(
      "auth/login/",
      "POST",
      "",
      formData,
      async (data:{session_id:string}) => {
        setSessionId(data.session_id)
        await require_auth(data.session_id)
        navigate("Home")
      },
      (e:any) => {console.log(e)}
    )
  }
  return (
    <View style={{flex:1, justifyContent:"center", alignItems: "center"}}>
      <View style={{width: "90%"}}>
        <Text>SAP ID:</Text>
        <TextInput
          style={{borderBottomWidth:1, marginBottom: 20, color: "black"}}
          placeholder="SAP ID..."
          value={formData.sap}
          onChange={val => setFormData({...formData, sap: val.nativeEvent.text})}/>
        <Text>Password</Text>
        <TextInput
          style={{borderBottomWidth:1, marginBottom: 20, color: "black"}}
          placeholder="Password..."
          value={formData.password}
          onChange={val => setFormData({...formData, password: val.nativeEvent.text})}/>
        <Button onPress={handleLogin} title="Login"/>
      </View>
    </View>
  )
}
export default Login