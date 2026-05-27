import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.selectionAsync();
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
