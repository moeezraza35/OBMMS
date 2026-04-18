import { ScrollView, Text, View } from 'react-native';
import NavBar from '../components/navbar';

function Notifications() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <Text>Notifications</Text>
      </ScrollView>
      <NavBar active={0}/>
    </View>
  )
}
export default Notifications;