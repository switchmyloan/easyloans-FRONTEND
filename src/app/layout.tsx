import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import PushNotificationProvider from "@/components/PushNotificationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cready - Financial Partner Application",
  description: "Apply with Cready's financial partners - KreditBee & MoneyView",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    // CLEVERTAP DISABLED
    // const cleverTapAccountId = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;
    // const cleverTapRegion = process.env.NEXT_PUBLIC_CLEVERTAP_REGION;

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0KNMJ616E9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0KNMJ616E9');
          `}
        </Script>


        {/* CLEVERTAP DISABLED */}
        {/* {cleverTapAccountId && (
          <>

            <Script id="clevertap-init" strategy="beforeInteractive">
              {`
                window.clevertap = {
                  event: [], profile: [], account: [],
                  onUserLogin: [], notifications: [], privacy: []
                };
                clevertap.account.push({ id: "${cleverTapAccountId}" });
                clevertap.privacy.push({ optOut: false });
                clevertap.privacy.push({ useIP: false });
                ${cleverTapRegion ? `clevertap.region = "${cleverTapRegion}";` : ""}
              `}
            </Script>
            <Script
              id="clevertap-sdk"
              src="https://d2r1yp2w7bby2u.cloudfront.net/js/a.js"
              strategy="afterInteractive"
            />
          </>
        )} */}
      </head>
      <body className="min-h-full bg-gray-50">
        {children}
        <PushNotificationProvider />
      </body>
    </html>
  );
}
