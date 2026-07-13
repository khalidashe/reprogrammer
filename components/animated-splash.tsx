import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

/**
 * Animated launch splash: the same `>R_` mark as the native splash and the app
 * icon, with the terminal cursor blinking. Rendered while the store hydrates,
 * after the native splash hands off (see app/_layout.tsx).
 *
 * The mark itself is the real `splash-icon.png` (so it is pixel-identical to the
 * native splash — no jump on handoff). The blink is done by toggling the opacity
 * of a small background-coloured patch that sits exactly over the green cursor:
 * opacity 1 hides the cursor, opacity 0 shows it. Coordinates are derived from
 * the glyph's position in the 1024² source art, scaled to the rendered size.
 */

const BG = '#111312';
const SIZE = 200; // matches expo-splash-screen `imageWidth` in app.json
const S = SIZE / 1024; // source art is a 1024² canvas

// Cursor bounding box in source-art units is ~x[633,827] y[608,666]; the patch
// is oversized a touch to fully cover it while clearing the R's leg (max x ~629).
const cursorPatch = {
  left: 630 * S,
  top: 600 * S,
  width: 212 * S,
  height: 82 * S,
};

export function AnimatedSplash() {
  // 0 = cursor visible, 1 = cursor hidden.
  const blink = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(530),
        Animated.timing(blink, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.delay(530),
        Animated.timing(blink, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  return (
    <View style={styles.fill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.mark}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Animated.View style={[styles.patch, cursorPatch, { opacity: blink }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: SIZE, height: SIZE },
  image: { width: SIZE, height: SIZE },
  patch: { position: 'absolute', backgroundColor: BG },
});
