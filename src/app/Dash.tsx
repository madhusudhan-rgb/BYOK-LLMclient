import { View, StyleSheet, Text, ImageBackground } from "react-native";
import { WebView } from "react-native-webview";

export default function Dash() {
  return (
    <ImageBackground source = {require("../../assets/images/bgpfp5.jpg")} style= {{flex : 1}}>
    <View style={styles.container}>
      <View style= {styles.dashcard}>
        <Text style= {{color : "white", fontWeight  :"200", fontSize : 19}}>
            API USAGE : N/A
            FEATURE COMING SOON
        </Text>
      </View>
    </View> 
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  dashcard  :{
    backgroundColor: "rgba(16, 16, 16, 0.49)",
    height  :200,
    width  : 300,
    borderRadius : 23,
    position : "absolute",
    top  :100,
    right : 50,
    justifyContent : "center",
    alignItems : "center"
  }
});