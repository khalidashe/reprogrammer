import { StyleSheet } from 'react-native';
import {
  Type,
  Space,
  Radius,
  type ThemeColors,
} from '@/constants/theme';

export function createMarkdownStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: {
      color: colors.text,
      ...Type.body,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: Space.md,
    },
    heading1: {
      ...Type.h1,
      color: colors.text,
      marginTop: Space.lg,
      marginBottom: Space.sm,
    },
    heading2: {
      ...Type.h2,
      color: colors.text,
      marginTop: Space.xl,
      marginBottom: Space.sm,
    },
    heading3: {
      ...Type.bodyBold,
      color: colors.text,
      marginTop: Space.lg,
      marginBottom: Space.xs,
    },
    strong: {
      fontWeight: '700',
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.text,
    },
    link: {
      color: colors.tint,
      textDecorationLine: 'underline',
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.tint,
      backgroundColor: colors.surfaceMuted,
      paddingLeft: Space.md,
      paddingRight: Space.md,
      paddingVertical: Space.sm,
      marginVertical: Space.md,
      borderRadius: Radius.sm,
    },
    bullet_list: {
      marginVertical: Space.sm,
    },
    ordered_list: {
      marginVertical: Space.sm,
    },
    list_item: {
      flexDirection: 'row',
      marginBottom: Space.xs,
    },
    bullet_list_icon: {
      color: colors.textMuted,
      marginRight: Space.sm,
      lineHeight: 22,
    },
    ordered_list_icon: {
      color: colors.textMuted,
      marginRight: Space.sm,
      lineHeight: 22,
      fontWeight: '600',
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: Space.lg,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      marginVertical: Space.md,
    },
    thead: {
      backgroundColor: colors.surfaceMuted,
    },
    th: {
      padding: Space.sm,
      fontWeight: '700',
      color: colors.text,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
    },
    td: {
      padding: Space.sm,
      color: colors.text,
      ...Type.caption,
    },
    code_inline: {
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      paddingHorizontal: Space.xs,
      paddingVertical: 1,
      borderRadius: Radius.sm,
      fontFamily: 'Menlo',
      ...Type.caption,
    },
    code_block: {
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      padding: Space.sm,
      borderRadius: Radius.sm,
      fontFamily: 'Menlo',
      ...Type.caption,
      marginVertical: Space.sm,
    },
    fence: {
      backgroundColor: colors.surfaceMuted,
      color: colors.text,
      padding: Space.sm,
      borderRadius: Radius.sm,
      fontFamily: 'Menlo',
      ...Type.caption,
      marginVertical: Space.sm,
    },
  });
}
