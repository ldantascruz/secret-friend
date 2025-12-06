import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Amigo Secreto",
    description: "Organize seu Amigo Secreto em segundos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
