import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";

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
  
  let role = 'seller';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role) {
      role = profile.role;
    } else if (user.user_metadata?.role) {
      role = user.user_metadata.role;
    } else if (user.email?.toLowerCase().includes('admin')) {
      role = 'admin';
    }
  } else {
    // Check if demo admin cookie is set
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const demoRole = cookieStore.get('circulon_role')?.value;
    const demoUser = cookieStore.get('circulon_user')?.value;
    if (demoRole) {
      role = demoRole;
      user = { email: demoUser || 'admin@circulon.ai', id: 'admin-demo-id' };
    }
  }

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col antialiased selection:bg-green-500 selection:text-white`}>
        {/* Top Navigation Menu Bar */}
        <Navbar userEmail={user?.email} role={role} />

        {user ? (
          <div className="flex flex-1 w-full min-h-screen">
            <Suspense fallback={<div className="w-64 bg-green-950 h-screen shrink-0" />}>
              <Sidebar role={role} userEmail={user?.email} />
            </Suspense>
            <div className="flex-1 overflow-y-auto w-full bg-gray-50">
              <main className="max-w-7xl mx-auto p-4 pt-16 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col w-full">
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </div>
        )}

        {/* Floating Right-Side AI Assistant Chatbot */}
        <AIChatbot />
      </body>
    </html>
  );
}
