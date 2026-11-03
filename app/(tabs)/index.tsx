
import { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Accelerometer } from "expo-sensors";

import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  G,
} from "react-native-svg";

const LARGEUR_ROUTE = 210;
const RAYON_BILLE = 15;
const HORIZON = 0.20;

// Vitesse générale du jeu
const VITESSE_BILLE = 50;

export default function Index() {
  const { width, height } = useWindowDimensions();

  const positionBille = {
    x: width / 2,
    y: height * 0.78,
  };

  // --------------------------------
  // CRÉATION DE LA ROUTE
  // --------------------------------

  function creerRoute() {
    const points = [];
    const centre = width / 2;

    function ajouterCourbe(p0, p1, p2, nombre = 70) {
      for (let i = 0; i <= nombre; i++) {
        const t = i / nombre;
        const inv = 1 - t;

        points.push({
          x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
          y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y,
        });
      }
    }

    const depart = { x: centre, y: height * 1.45 };
    const p1 = { x: centre, y: height * 1.05 };
    const p2 = { x: centre + 100, y: height * 0.72 };
    const p3 = { x: centre + 110, y: height * 0.48 };
    const p4 = { x: centre - 100, y: height * 0.32 };
    const arrivee = { x: centre - 30, y: height * 0.18 };

    ajouterCourbe(depart, p1, p2);
    ajouterCourbe(p2, p3, p4);
    ajouterCourbe(p4, arrivee, arrivee);

    return points;
  }

  const pointsRoute = creerRoute();

  // --------------------------------
  // POSITION INITIALE
  // --------------------------------

  const profondeurBille =
    (positionBille.y - height * HORIZON) /
    (height * (1 - HORIZON));

  const decalageInitial = {
    x: 0,
    y: profondeurBille * height - pointsRoute[0].y,
  };

  const [jeu, setJeu] = useState({
    decalage: decalageInitial,
    progression: 0,
  });

  // --------------------------------
  // PROJECTION PERSPECTIVE
  // --------------------------------

  function projeter(point, offset) {
    const mondeX = point.x + offset.x;
    const mondeY = point.y + offset.y;

    const profondeur = Math.max(0, Math.min(1.4, mondeY / height));
    const echelle = 0.07 + profondeur * 0.90;

    return {
      x: width / 2 + (mondeX - width / 2) * echelle,
      y: height * HORIZON + profondeur * height * (1 - HORIZON),
      echelle,
    };
  }

  // --------------------------------
  // BORDS DE LA ROUTE
  // --------------------------------

  function calculerBords(points) {
    const gauche = [];
    const droite = [];

    points.forEach((point, index) => {
      const avant = points[Math.max(0, index - 1)];
      const apres = points[Math.min(points.length - 1, index + 1)];

      const dx = apres.x - avant.x;
      const dy = apres.y - avant.y;
      const longueur = Math.hypot(dx, dy) || 1;

      const nx = -dy / longueur;
      const ny = dx / longueur;

      const demiLargeur = LARGEUR_ROUTE / 2 * point.echelle;

      gauche.push({
        x: point.x + nx * demiLargeur,
        y: point.y + ny * demiLargeur,
      });

      droite.push({
        x: point.x - nx * demiLargeur,
        y: point.y - ny * demiLargeur,
      });
    });

    return { gauche, droite };
  }

  function creerChemin(points) {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }

  function creerSurface(gauche, droite) {
    return (
      creerChemin(gauche) +
      " " +
      droite
        .slice()
        .reverse()
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ") +
      " Z"
    );
  }

  // --------------------------------
  // COLLISION
  // --------------------------------

  function distanceSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const longueur = dx * dx + dy * dy;

    if (longueur === 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }

    let t =
      ((point.x - a.x) * dx + (point.y - a.y) * dy) /
      longueur;

    t = Math.max(0, Math.min(1, t));

    const projection = {
      x: a.x + t * dx,
      y: a.y + t * dy,
    };

    return Math.hypot(
      point.x - projection.x,
      point.y - projection.y
    );
  }

  function estSurRoute(points, offset) {
    const projetes = points.map((p) => projeter(p, offset));

    for (let i = 0; i < projetes.length - 1; i++) {
      const distance = distanceSegment(
        positionBille,
        projetes[i],
        projetes[i + 1]
      );

      const largeur =
        LARGEUR_ROUTE / 2 *
        (projetes[i].echelle + projetes[i + 1].echelle) / 2;

      if (distance < largeur - RAYON_BILLE) {
        return true;
      }
    }

    return false;
  }

  // --------------------------------
  // LIGNE DE DÉPART
  // --------------------------------

  function creerLigneDepart(gauche, droite) {
    const cases = [];
    const nombre = 12;

    for (let i = 0; i < nombre; i++) {
      const t1 = i / nombre;
      const t2 = (i + 1) / nombre;

      const x1 = gauche.x + (droite.x - gauche.x) * t1;
      const y1 = gauche.y + (droite.y - gauche.y) * t1;
      const x2 = gauche.x + (droite.x - gauche.x) * t2;
      const y2 = gauche.y + (droite.y - gauche.y) * t2;

      cases.push({
        d: `M ${x1} ${y1} L ${x2} ${y2} L ${x2} ${y2 + 5} L ${x1} ${y1 + 5} Z`,
        couleur: i % 2 === 0 ? "#FFFFFF" : "#171923",
      });
    }

    return cases;
  }

  // --------------------------------
  // PROGRESSION ET PAYSAGES
  // --------------------------------

  const progression = jeu.progression;

  const numeroPaysage =
    Math.floor(progression / (height * 2.5)) % 3;

  const paysages = [
    {
      ciel1: "#101B3A",
      ciel2: "#F39B70",
      montagne1: "#526B82",
      montagne2: "#263C39",
      sol: "#263C39",
      arbres: "#102D2B",
    },
    {
      ciel1: "#092B35",
      ciel2: "#79A98A",
      montagne1: "#416C57",
      montagne2: "#1C4934",
      sol: "#183D2C",
      arbres: "#0B2B1D",
    },
    {
      ciel1: "#130D36",
      ciel2: "#6C4DA5",
      montagne1: "#554B83",
      montagne2: "#24204D",
      sol: "#171735",
      arbres: "#26205D",
    },
  ];

  const paysage = paysages[numeroPaysage];

  // Défilement du décor
  const mouvementMontagnes = progression * 0.035;
  const mouvementArbres = progression * 0.55;
  const mouvementNuages = progression * 0.018;

  // --------------------------------
  // CRÉATION DES ARBRES
  // --------------------------------

  const arbres = [];

  for (let i = 0; i < 18; i++) {
    const coteGauche = i % 2 === 0;

    const y =
      ((i * height * 0.12 + mouvementArbres) %
        (height * 0.9)) +
      height * 0.05;

    const x = coteGauche
      ? width * (0.04 + (i % 3) * 0.035)
      : width * (0.82 + (i % 3) * 0.035);

    const taille = 18 + (i % 3) * 9;

    arbres.push({ x, y, taille });
  }

  // --------------------------------
  // ACCÉLÉROMÈTRE
  // --------------------------------

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);

    const abonnement = Accelerometer.addListener(({ x, y }) => {
      setJeu((ancien) => {
        const nouveau = {
          x: ancien.decalage.x + x * VITESSE_BILLE,
          y: ancien.decalage.y - y * VITESSE_BILLE,
        };

        if (!estSurRoute(pointsRoute, nouveau)) {
          return ancien;
        }

        const distance = Math.abs(
          nouveau.y - ancien.decalage.y
        );

        return {
          decalage: nouveau,
          progression: ancien.progression + distance,
        };
      });
    });

    return () => abonnement.remove();
  }, [width, height]);

  // --------------------------------
  // ROUTE PROJETÉE
  // --------------------------------

  const pointsProjetes = pointsRoute.map((p) =>
    projeter(p, jeu.decalage)
  );

  const { gauche, droite } = calculerBords(pointsProjetes);

  const surfaceRoute = creerSurface(gauche, droite);

  const casesDepart = creerLigneDepart(gauche[0], droite[0]);

  const pointilles = [];

  for (let i = 0; i < pointsProjetes.length - 1; i += 12) {
    const segment = pointsProjetes.slice(i, i + 5);

    if (segment.length > 1) {
      pointilles.push(creerChemin(segment));
    }
  }

  // --------------------------------
  // AFFICHAGE
  // --------------------------------

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={paysage.ciel1} />
            <Stop offset="1" stopColor={paysage.ciel2} />
          </LinearGradient>

          <LinearGradient id="montagne" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={paysage.montagne1} />
            <Stop offset="1" stopColor={paysage.montagne2} />
          </LinearGradient>

          <LinearGradient id="route" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#596675" />
            <Stop offset="1" stopColor="#252D39" />
          </LinearGradient>

          <RadialGradient id="bille">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.22" stopColor="#A8F3FF" />
            <Stop offset="0.65" stopColor="#168FEF" />
            <Stop offset="1" stopColor="#06417E" />
          </RadialGradient>
        </Defs>

        {/* CIEL */}
        <Rect width={width} height={height} fill="url(#ciel)" />

        {/* SOLEIL */}
        <Circle
          cx={width * 0.76}
          cy={height * 0.20}
          r="43"
          fill="#FFD58A"
          opacity="0.16"
        />

        <Circle
          cx={width * 0.76}
          cy={height * 0.20}
          r="27"
          fill="#FFE6AD"
        />

        {/* NUAGES */}
        {[0, 1, 2, 3].map((i) => {
          const x =
            ((i * width * 0.48 + mouvementNuages) %
              (width * 1.5)) -
            width * 0.2;

          const y = height * (0.12 + (i % 2) * 0.07);

          return (
            <G key={`nuage-${i}`}>
              <Ellipse
                cx={x}
                cy={y}
                rx="27"
                ry="8"
                fill="#FFFFFF"
                opacity="0.2"
              />
              <Circle
                cx={x - 12}
                cy={y - 4}
                r="9"
                fill="#FFFFFF"
                opacity="0.2"
              />
              <Circle
                cx={x + 9}
                cy={y - 5}
                r="11"
                fill="#FFFFFF"
                opacity="0.2"
              />
            </G>
          );
        })}

        {/* MONTAGNES */}
        <Path
          d={`M ${-mouvementMontagnes} ${height * 0.43}
              L ${width * 0.17 - mouvementMontagnes} ${height * 0.27}
              L ${width * 0.31 - mouvementMontagnes} ${height * 0.42}
              L ${width * 0.48 - mouvementMontagnes} ${height * 0.25}
              L ${width * 0.66 - mouvementMontagnes} ${height * 0.43}
              L ${width * 0.83 - mouvementMontagnes} ${height * 0.30}
              L ${width * 1.5} ${height * 0.42}
              L ${width * 1.5} ${height * 0.65}
              L 0 ${height * 0.65} Z`}
          fill={paysage.montagne1}
        />

        <Path
          d={`M 0 ${height * 0.49}
              L ${width * 0.18} ${height * 0.39}
              L ${width * 0.36} ${height * 0.51}
              L ${width * 0.58} ${height * 0.37}
              L ${width * 0.77} ${height * 0.51}
              L ${width} ${height * 0.40}
              L ${width} ${height * 0.72}
              L 0 ${height * 0.72} Z`}
          fill="url(#montagne)"
        />

        {/* SOL */}
        <Rect
          x="0"
          y={height * 0.55}
          width={width}
          height={height * 0.45}
          fill={paysage.sol}
        />

        {/* ARBRES */}
        {arbres.map((arbre, i) => (
          <Path
            key={`arbre-${i}`}
            d={`M ${arbre.x} ${arbre.y}
                L ${arbre.x - arbre.taille * 0.55} ${arbre.y}
                L ${arbre.x} ${arbre.y - arbre.taille * 2}
                L ${arbre.x + arbre.taille * 0.55} ${arbre.y} Z`}
            fill={paysage.arbres}
          />
        ))}

        {/* ROUTE */}
        <Path d={surfaceRoute} fill="url(#route)" />

        {/* OMBRE */}
        <Path
          d={creerChemin(gauche)}
          stroke="#111923"
          strokeWidth="5"
          opacity="0.35"
          fill="none"
        />

        {/* POINTILLÉS */}
        {pointilles.map((d, i) => (
          <Path
            key={`pointille-${i}`}
            d={d}
            stroke="#F9E9B7"
            strokeWidth="2"
            strokeDasharray="8 12"
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* LIGNE DE DÉPART */}
        {casesDepart.map((item, i) => (
          <Path
            key={`case-${i}`}
            d={item.d}
            fill={item.couleur}
          />
        ))}

        {/* OMBRE DE LA BILLE */}
        <Ellipse
          cx={positionBille.x}
          cy={positionBille.y + 16}
          rx="19"
          ry="7"
          fill="#07111F"
          opacity="0.5"
        />

        {/* BILLE */}
        <Circle
          cx={positionBille.x}
          cy={positionBille.y}
          r={RAYON_BILLE}
          fill="url(#bille)"
        />

        {/* REFLET */}
        <Ellipse
          cx={positionBille.x - 5}
          cy={positionBille.y - 7}
          rx="5"
          ry="3"
          fill="#FFFFFF"
          opacity="0.85"
        />

        <Circle
          cx={positionBille.x + 6}
          cy={positionBille.y + 6}
          r="3"
          fill="#8BEAFF"
          opacity="0.7"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101B3A",
  },
});
