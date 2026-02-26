import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import NavBar from "../components/navbar"

function Home() {
  return (
    <View style={{flex:1, backgroundColor: "white"}}>
      <ScrollView style={{flex:1}}>
        <View style={{height: 500}}>
          <WebView source={{ uri: 'http://localhost:3000/map/' }} style={{ flex: 1, borderBottomWidth: 1 }}/>
        </View>
        <View style={{backgroundColor: "#fefefe", height: 500}}>
          <View style={{padding: 3, backgroundColor: "gray", width: 100, marginHorizontal: "auto", marginVertical: 10, borderRadius: 3}}></View>
        </View>
      </ScrollView>
      <NavBar active={2}/>
    </View>
  )
}
export default Home;