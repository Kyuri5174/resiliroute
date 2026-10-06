import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";

const title = "ResiliRoute — Urban Mobility Resilience Simulator";
const description =
  "Stress-test a synthetic city’s mobility network, trace cascading disruption impacts, and compare critical infrastructure and recovery strategies.";
export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: { title, description, type: "website", locale: "en_US", siteName: "ResiliRoute" },
  twitter: { card: "summary", title, description },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
