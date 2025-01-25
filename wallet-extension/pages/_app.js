import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";

export default function App({ Component, pageProps }) {
  return (
    // Adding a max width and height for extension popup
    <div className="w-[400px] h-[600px] overflow-auto">
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </div>
  );
}
