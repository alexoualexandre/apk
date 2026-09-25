import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={{marginTop: "50%"}}>
      <Text>Page accueil</Text>

      <Link href="/about?id=28">
        Aller vers About saloprie
      </Link>
    </View>
  );
}
