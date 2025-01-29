import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 