import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
{
  /*import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import { useState, useEffect } from "react";


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
*/
}

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

const route = [{ x: 30, y: 100 }];

// Calcule les points d'une courbe de Bézier
function ajouterCourbe(p0, p1, p2, p3, nombre = 100) {
  const points = [];

  for (let i = 1; i <= nombre; i++) {
    const t = i / nombre;
    const u = 1 - t;

    const x =
      u ** 3 * p0.x +
      3 * u ** 2 * t * p1.x +
      3 * u * t ** 2 * p2.x +
      t ** 3 * p3.x;

    const y =
      u ** 3 * p0.y +
      3 * u ** 2 * t * p1.y +
      3 * u * t ** 2 * p2.y +
      t ** 3 * p3.y;

    points.push({ x, y });
  }

  return points;
}

// Reproduit les deux courbes de notre dessin SVG
const pointsRoute = [
  ...route,
  ...ajouterCourbe(
    { x: 70, y: 100 },
    { x: 30, y: 30 },
    { x: 200, y: 30 },
    { x: 200, y: 120 },
  ),
  ...ajouterCourbe(
    { x: 200, y: 120 },
    { x: 200, y: 210 },
    { x: 50, y: 180 },
    { x: 80, y: 280 },
  ),
];

function distanceSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const longueurCarree = dx * dx + dy * dy;

  if (longueurCarree === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }

  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / longueurCarree;

  // On limite la projection au segment
  t = Math.max(0, Math.min(1, t));

  const procheX = a.x + t * dx;
  const procheY = a.y + t * dy;

  return Math.hypot(point.x - procheX, point.y - procheY);
}

function estSurRoute(x, y) {
  const centre = {
    x: x + 15,
    y: y + 15,
  };

  let distanceMin = Infinity;

  for (let i = 0; i < pointsRoute.length - 1; i++) {
    const distance = distanceSegment(
      centre,
      pointsRoute[i],
      pointsRoute[i + 1],
    );

    distanceMin = Math.min(distanceMin, distance);
  }

  return distanceMin <= 35;
}

export default function Index() {
  const { width, height } = useWindowDimensions();

  const [position, setPosition] = useState({
    x: 15,
    y: 85,
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(8);

    const subscription = Accelerometer.addListener(({ x, y }) => {
      setPosition((ancienne) => {
        const nouvelleX = Math.max(
          0,
          Math.min(width - 30, ancienne.x - x * 10),
        );

        const nouvelleY = Math.max(
          0,
          Math.min(height - 30, ancienne.y + y * 10),
        );

        if (estSurRoute(nouvelleX, nouvelleY)) {
          return {
            x: nouvelleX,
            y: nouvelleY,
          };
        }

        // Collision : on conserve la position actuelle
        return ancienne;
      });

      ///////
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
 <Svg
        width="100%"
        height="100%"
        style={{ position: "absolute", backgroundColor: "red" }}
      >
        {/* Le chemin de la route */}
        <Path
          // d="M 70 100 C 30 30, 200 30, 200 120 S 50 180, 80 280"
          d="M 30 100 C 30 00, 000 00, 000 000 S 00 000, 00 000"
          stroke="#555555"
          strokeWidth="100"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Le centre de la route */}
        <Path
          // d="M 30 100 C 30 30, 200 30, 200 120 S 50 180, 80 280"
          d="M 00 000 C 00 00, 000 00, 000 000 S 00 000, 00 000"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="8 8"
          fill="none"
        />
      </Svg>
      {/* <View style={styles.mur} /> */}
 
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
    backgroundColor: "white",
  },
  mur: {
    position: "absolute",
    left: 100,
    top: 200,
    width: 150,
    height: 15,
    backgroundColor: "blue",
  },
});
