import { ScrollView, Text, View } from 'react-native';
import NavBar from '../components/navbar';

function Schedule() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <Text>Schedule</Text>
      </ScrollView>
      <NavBar active={4}/>
    </View>
  )
}
export default Schedule;