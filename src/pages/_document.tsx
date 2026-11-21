import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Next.js Document component.
 * Configures the top-level HTML document structure, language attribute,
 * and preloads typography for all themes and reward fonts.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Audiowide&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700&family=DotGothic16&family=Inter:wght@400;500;600;700&family=Orbitron:wght@600;800&family=Press+Start+2P&family=Rajdhani:wght@600;700&family=Share+Tech+Mono&family=Shippori+Mincho:wght@600;800&family=VT323&family=Yuji+Boku&family=Zen+Maru+Gothic:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
