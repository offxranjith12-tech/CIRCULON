import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CIRCULON | AI Waste-to-Buyer Intelligence Platform",
  description: "Don't recycle everything. Find who already needs it. AI-powered industrial waste matching and circular economy intelligence.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const sessionRole = cookieStore.get('circulon_role')?.value;
  const sessionUser = cookieStore.get('circulon_user')?.value;

  let role = sessionRole || 'seller';
  let user: any = null;

  // Fast-path: If active session cookies exist, immediately construct session user in 0ms
  if (sessionRole && sessionUser) {
    user = { 
      email: sessionUser, 
      id: 'session-user', 
      user_metadata: { role: sessionRole, company_name: sessionUser.split('@')[0] } 
    };
    role = sessionRole;
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
      if (user) {
        role = user.user_metadata?.role || (user.email?.toLowerCase().includes('admin') ? 'admin' : (user.email?.toLowerCase().includes('buyer') ? 'buyer' : (user.email?.toLowerCase().includes('driver') ? 'driver' : 'seller')));
      }
    } catch {
      user = null;
    }
  }

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col antialiased selection:bg-green-500 selection:text-white`}>
        <AppLayout user={user} role={role}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
