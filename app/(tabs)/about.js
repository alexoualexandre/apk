import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { MyContext } from "./Context.js";

export default function About() {
  const { id } = useLocalSearchParams();

  const { name } = MyContext();

  return (
    <View style={{ marginTop: "50%" }}>
      <Text>
        Page About {id} et le context est {name}
      </Text>
    </View>
  );
}
