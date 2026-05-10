declare module "react-native-vector-icons/MaterialCommunityIcons" {
  import type { ComponentType } from "react";
  import type { TextProps } from "react-native";

  type IconProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  type IconComponent = ComponentType<IconProps> & {
    loadFont: () => Promise<void>;
    glyphMap: Record<string, number>;
  };

  const MaterialCommunityIcons: IconComponent;
  export default MaterialCommunityIcons;
}
