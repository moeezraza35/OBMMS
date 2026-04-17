import { Text, View, ScrollView } from 'react-native';
import NavBar from '../components/navbar';

function Dues() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <Text>Dues</Text>
      </ScrollView>
      <NavBar active={2}/>
    </View>
  )
}
export default Dues;