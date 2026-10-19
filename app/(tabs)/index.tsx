{/*import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import styles from '../../styles/globalStyles';

export default function Index() {


const [state,setState] = useState(false);

useEffect(
()=>{fetch('http://77.37.51.45:5010/teste').
then((res)=>res.json()
).
then((resp)=>{
setState(resp);

});
},[]
);
  return (
    <View style={styles.container}>
      <Text>Page accueil</Text>

      <Link href="/about?id=28" style={styles.color}>
        ller  About {state && state[0].name}
      </Link>
    </View>
  );
}
*/}

import { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Accelerometer } from "expo-sensors";

function collision(x, y) {
  const tailleBille = 30;

  const mur = {
    left: 100,
    top: 200,
    width: 150,
    height: 15,
  };

  return (
    x < mur.left + mur.width &&
    x + tailleBille > mur.left &&
    y < mur.top + mur.height &&
    y + tailleBille > mur.top
  );
}

export default function Index() {
const { width, height } = useWindowDimensions();

  console.log("Largeur :", width);
  console.log("Hauteur :", height);
console.log("hello");


  const [position, setPosition] = useState({
    x: 150,
    y: 250,
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(8);

    const subscription = Accelerometer.addListener(
      ({ x, y }) => {



/*        setPosition((ancienne) => ({
          x: Math.max(0, Math.min(width - 30, ancienne.x + x * 10)),
          y: Math.max(0, Math.min(height - 30, ancienne.y - y * 10)),
        }));
*/


////////

setPosition((ancienne) => {
  const nouvelleX = Math.max(
    0,
    Math.min(width - 30, ancienne.x - x * 10)
  );

  const nouvelleY = Math.max(
    0,
    Math.min(height - 30, ancienne.y + y * 10)
  );

  if (collision(nouvelleX, nouvelleY)) {
    return ancienne;
  }

  return {
    x: nouvelleX,
    y: nouvelleY,
  };
});




///////

      }
    );

    return () => subscription.remove();
  }, []);

    return (
  <View style={styles.container}>
    <View style={styles.mur} />

    <View
      style={[
        styles.bille,
        {
          left: position.x,
          top: position.y,
        },
      ]}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  bille: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "red",
  },
mur: {
  position: "absolute",
  left: 100,
  top: 200,
  width: 150,
  height: 15,
  backgroundColor: "black",
},



});
