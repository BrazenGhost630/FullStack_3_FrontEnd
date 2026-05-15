import React, { ReactNode } from 'react';
import { View, ViewStyle, ViewProps as RNViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ThemedViewProps extends RNViewProps {
  lightColor?: string;
  darkColor?: string;
  children: ReactNode;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = lightColor ?? Colors[colorScheme].background;

  const viewStyle: ViewStyle = {
    backgroundColor,
  };

  return <View style={[viewStyle, style]} {...rest} />;
}
