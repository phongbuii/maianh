import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mai Anh (っ◔◡◔)っ ❤️ ", // Thay bằng tiêu đề bạn muốn
  description: "Một cô gái dễ thương xinh đẹp.", // Thay bằng mô tả bạn muốn
  icons: {
    icon: "images/maianh.png", // Hoặc đường dẫn đến tệp biểu tượng của bạn, ví dụ: '/icon.png'
    // apple: "/apple-icon.png", // Tùy chọn: cho thiết bị Apple
    // shortcut: "/shortcut-icon.png" // Tùy chọn: cho shortcut
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
