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
  const supabase = await createClient();
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    user = null;
  }
  
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const sessionRole = cookieStore.get('circulon_role')?.value;
  const sessionUser = cookieStore.get('circulon_user')?.value;

  let role = sessionRole || 'seller';

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (sessionRole) {
      role = sessionRole;
    } else if (profile?.role) {
      role = profile.role;
    } else if (user.user_metadata?.role) {
      role = user.user_metadata.role;
    } else if (user.email?.toLowerCase().includes('admin')) {
      role = 'admin';
    } else if (user.email?.toLowerCase().includes('driver')) {
      role = 'driver';
    } else if (user.email?.toLowerCase().includes('buyer')) {
      role = 'buyer';
    }
  } else if (sessionRole) {
    role = sessionRole;
    user = { email: sessionUser || `${sessionRole}@circulon.com`, id: 'session-user' };
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
