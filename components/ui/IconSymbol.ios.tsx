import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  Home as LucideHome,
  Send as LucideSend,
  Bookmark as LucideBookmark,
  User as LucideUser,
  ChevronRight as LucideChevronRight,
  Code as LucideCode,
} from 'lucide-react-native';

type IconName =
  | 'house.fill'
  | 'paperplane.fill'
  | 'bookmark.fill'
  | 'person.fill'
  | 'chevron.right'
  | 'chevron.left.forwardslash.chevron.right';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const common = { color, size } as const;
  switch (name) {
    case 'house.fill':
      return <LucideHome {...common} style={style} />;
    case 'paperplane.fill':
      return <LucideSend {...common} style={style} />;
    case 'bookmark.fill':
      return <LucideBookmark {...common} style={style} />;
    case 'person.fill':
      return <LucideUser {...common} style={style} />;
    case 'chevron.right':
      return <LucideChevronRight {...common} style={style} />;
    case 'chevron.left.forwardslash.chevron.right':
      return <LucideCode {...common} style={style} />;
    default:
      return <LucideCode {...common} style={style} />;
  }
}
