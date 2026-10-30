import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

// Calcule les points d'une courbe de Bézier quadratique
function ajouterCourbe(p0, p1, p2, nombre = 100) {
  const points = [];

  for (let i = 1; i <= nombre; i++) {
    const t = i / nombre;
    const u = 1 - t;

    const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;

    const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;

    points.push({ x, y });
  }

  return points;
}

// Calcule la distance entre un point et un segment
function distanceSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const longueurCarree = dx * dx + dy * dy;

  if (longueurCarree === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }

  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / longueurCarree;

  t = Math.max(0, Math.min(1, t));

  const procheX = a.x + t * dx;
  const procheY = a.y + t * dy;

  return Math.hypot(point.x - procheX, point.y - procheY);
}

// Vérifie si la bille est sur la route
function estSurRoute(x, y, pointsRoute) {
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

  return distanceMin <= 37;
}

export default function Index() {
  const { width, height } = useWindowDimensions();

  // Points utilisés pour vérifier les collisions
  const pointsRoute = [
    { x: width / 2, y: height },

    ...ajouterCourbe(
      { x: width / 2, y: height },
      { x: 150, y: 500 },
      { x: 270, y: 600 },
    ),

    ...ajouterCourbe(
      { x: 270, y: 600 },
      { x: 375, y: 700 },
      { x: 335, y: 500 },
    ),
    ...ajouterCourbe(
      { x: 335, y: 500 },
      { x: 200, y: 350 },
      { x: 100, y: 400 },
    ),
  ];

  // Position initiale de la bille
  const [position, setPosition] = useState({
    x: width / 2 - 15,
    y: height - 30,
  });

  // Réinitialise la position si les dimensions changent
  useEffect(() => {
    setPosition({
      x: width / 2 - 15,
      y: height - 30,
    });
  }, [width, height]);

  // Contrôle avec l'accéléromètre
  useEffect(() => {
    Accelerometer.setUpdateInterval(16);

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

        if (estSurRoute(nouvelleX, nouvelleY, pointsRoute)) {
          return {
            x: nouvelleX,
            y: nouvelleY,
          };
        }

        return ancienne;
      });
    });

    return () => subscription.remove();
  }, [width, height]);

  // Trajectoire visible
  const chemin =
    `M ${width / 2} ${height} ` +
    `Q 150 500 270 600 ` +
    `Q 375 700 335 500` +
    `Q 200 350 100 400`;

  return (
    <View style={styles.container}>
      {/* Route */}
      <Svg width={width} height={height} style={styles.route}>
        <Path
          d={chemin}
          stroke="white"
          strokeWidth={100}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <Path
          d={chemin}
          stroke="black"
          strokeWidth={3}
          strokeDasharray="8 8"
          fill="none"
        />
      </Svg>

      {/* Bille bleue brillante */}
      <Svg
        width={30}
        height={30}
        viewBox="0 0 30 30"
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
        }}
      >
        <Defs>
          <RadialGradient
            id="bleuBrillant"
            cx="30%"
            cy="25%"
            rx="75%"
            ry="75%"
            fx="25%"
            fy="20%"
          >
            <Stop offset="0%" stopColor="#D9FAFF" />
            <Stop offset="18%" stopColor="#65E1FF" />
            <Stop offset="45%" stopColor="#079BFF" />
            <Stop offset="75%" stopColor="#0754E8" />
            <Stop offset="100%" stopColor="#021C69" />
          </RadialGradient>
        </Defs>

        {/* Ombre sous la bille */}
        <Circle cx={15} cy={16} r={13.5} fill="#00123F" opacity={0.35} />

        {/* Corps de la bille */}
        <Circle
          cx={15}
          cy={14.5}
          r={14}
          fill="url(#bleuBrillant)"
          stroke="#48CFFF"
          strokeWidth={0.8}
        />

        {/* Grand reflet */}
        <Circle cx={9} cy={7} r={3.2} fill="white" opacity={0.98} />

        {/* Petit reflet secondaire */}
        <Circle cx={5.5} cy={11} r={1.2} fill="white" opacity={0.9} />

        {/* Reflet en bas */}
        <Circle cx={21} cy={22} r={1.5} fill="#D8FAFF" opacity={0.95} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "green",
  },

  route: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
