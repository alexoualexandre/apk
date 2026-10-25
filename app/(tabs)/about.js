/*import { useLocalSearchParams } from "expo-router";
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
*/

import Svg, { Path } from "react-native-svg";

export default function About() {
  return (
    <Svg width="100%" height={300}>
      <Path
        d="M 30 200 Q 150 0 270 200"
        stroke="red"
        strokeWidth={4}
        fill="none"
      />
    </Svg>
  );
}

