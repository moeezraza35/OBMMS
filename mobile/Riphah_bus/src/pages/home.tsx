import { ScrollView, Text, View, StyleSheet } from 'react-native';
import NavBar from "../components/navbar"

function Home() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <View>
          <Text>Map will show here</Text>
        </View>
      </ScrollView>
      <NavBar active={2}/>
    </View>
  )
}
export default Home;