import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Next.js Document component.
 * Configures the top-level HTML document structure and language attribute.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
