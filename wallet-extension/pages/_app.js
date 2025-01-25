import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    // Adding a max width and height for extension popup
    <div className="w-[400px] h-[600px] overflow-auto">
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </div>
  );
}
