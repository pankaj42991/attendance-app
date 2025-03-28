import { DefaultTheme } from "react-native-paper"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4F46E5", // Indigo
    secondary: "#6B7280", // Gray
    background: "#FFFFFF",
    surface: "#F9FAFB",
    accent: "#10B981", // Emerald
    error: "#EF4444", // Red
    text: "#1F2937",
    disabled: "#D1D5DB",
    placeholder: "#9CA3AF",
    backdrop: "rgba(0, 0, 0, 0.5)",
  },
  roundness: 8,
}

