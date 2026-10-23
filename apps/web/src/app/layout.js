import "./globals.css";
import AppProviders from "@/providers/query-provider";



export const metadata = {
  title: "Adaptive Planner",
  description: "Plan goals, execute tasks, and recover intelligently.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
