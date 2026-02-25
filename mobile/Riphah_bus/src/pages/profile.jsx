import { ScrollView, Text, View } from 'react-native';
import NavBar from '../components/navbar';

function Profile() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex: 1}}>
        <Text>Profile</Text>
      </ScrollView>
      <NavBar active={3}/>
    </View>
  )
}
export default Profile;