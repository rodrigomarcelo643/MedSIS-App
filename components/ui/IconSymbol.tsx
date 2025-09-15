import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Tab Bar Icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'arrow.up.forward': 'arrow-upward',
  'qrcode': 'qr-code-scanner',
  'person.fill': 'person',
  
  // Additional icons
  'chart.bar.fill': 'bar-chart',
  'doc.text.fill': 'description',
  'list.bullet.clipboard': 'checklist',
} as const satisfies IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const weightMap = {
    'ultralight': '100',
    'thin': '200',
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'heavy': '800',
    'black': '900',
  };

  return (
    <MaterialIcons 
      name={MAPPING[name]} 
      size={size} 
      color={color} 
      style={[
        style,
        { fontWeight: weightMap[weight] }
      ]}
    />
  );
}