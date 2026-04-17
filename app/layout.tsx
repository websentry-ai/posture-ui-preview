import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TenantStrip from '@/components/TenantStrip';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
const fira = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  title: 'Unbound Posture — Preview',
  description:
    'Preview of the revamped Posture & Discovery section. Mock data, static export.',
  icons: {
    icon: [{ url: './favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fira.variable}`}>
      <body className="min-h-screen">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col">
            <TenantStrip />
            <div className="max-w-[1400px] w-full mx-auto px-6 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
