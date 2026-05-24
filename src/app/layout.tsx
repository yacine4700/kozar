import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-kufi",
});

export const metadata: Metadata = {
  title: "زهرة الربيع للأناقة - نظام طلبات الجملة",
  description: "نظام طلبات الجملة المباشر لمتجر زهرة الربيع للأناقة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${inter.variable} ${notoKufi.variable} font-kufi`}
      >
        {children}
      </body>
    </html>
  );
}
