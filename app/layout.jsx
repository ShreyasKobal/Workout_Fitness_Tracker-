import './globals.css';

export const metadata = {
  title: 'Workout Progress Tracker',
  description: 'Personal running & walking tracker with dashboard, analytics, and personal records.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
