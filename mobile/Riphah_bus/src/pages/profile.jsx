import { ScrollView, Text, View } from 'react-native';
import NavBar from '../components/navbar';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';

function Profile() {
  const {user, permissions} = useContext(AuthContext)
  useEffect(() => {
    if (user === null){
      navigate("Login")
    }
  })
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex: 1}}>
        <Text>ID: {user.id}</Text>
        <Text>Name: {user.name}</Text>
        <Text>Permissions: {user.is_admin?"Admin":JSON.stringify(permissions)}</Text>
      </ScrollView>
      <NavBar active={3}/>
    </View>
  )
}
export default Profile;