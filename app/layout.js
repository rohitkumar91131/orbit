import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HabitProvider } from "./context/HabitContext";
import { Toaster, toast } from 'sonner';
import { HabitDetailProvider } from "./context/HabitDetailContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Orbit",
  description: "A habit tracking app",
};

// src/app/layout.js

// export const metadata = {
//   title: "Habit Tracker", // Ye EXACT same hona chahiye jo Google Console mein "App Name" hai
//   description: "Your daily habit tracking companion",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HabitProvider>
          <HabitDetailProvider>
          <Toaster/>
        {children}
        </HabitDetailProvider>
        </HabitProvider>
      </body>
    </html>
  );
}
