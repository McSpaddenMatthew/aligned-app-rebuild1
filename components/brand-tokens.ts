export const brand = {
  name: "Aligned",
  color: {
    bg: "#FFFFFF",
    fg: "#0B1220",
    primary: {
      50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE", 300: "#93C5FD",
      400: "#60A5FA", 500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8",
      800: "#1E40AF", 900: "#1E3A8A",
    },
    accent: "#10B981",
    warning: "#F59E0B",
    danger:  "#EF4444",
    border:  "#E5E7EB",
    muted:   "#6B7280",
  },
  radius: { sm: "0.5rem", md: "1rem", lg: "1.25rem", xl: "1.5rem" },
  shadow: { card: "0 6px 24px rgba(2, 6, 23, 0.06)", header: "0 10px 30px rgba(2, 6, 23, 0.08)" },
  font: {
    heading: "ui-sans-serif, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji'",
    body:    "ui-sans-serif, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
};

export const classes = {
  container: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "bg-white rounded-2xl border border-gray-100 shadow-xl",
  buttonPrimary:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold bg-blue-600 text-white border border-blue-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600",
  buttonGhost:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600",
};
