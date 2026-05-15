import React, { ReactNode } from 'react';
import { Text, TextStyle, TextProps as RNTextProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type TextType = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';

interface ThemedTextProps extends RNTextProps {
  type?: TextType;
  lightColor?: string;
  darkColor?: string;
  children: ReactNode;
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const color = lightColor ?? Colors[colorScheme].text;

  const textStyle: TextStyle = {
    color,
    ...(type === 'default' && {
      fontSize: 16,
      lineHeight: 24,
    }),
    ...(type === 'title' && {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    }),
    ...(type === 'defaultSemiBold' && {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    }),
    ...(type === 'subtitle' && {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: 28,
    }),
    ...(type === 'link' && {
      fontSize: 16,
      lineHeight: 24,
      textDecorationLine: 'underline',
    }),
  };

  return <Text style={[textStyle, style]} {...rest} />;
}
