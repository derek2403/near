import { NextUIProvider } from "@nextui-org/react";
import Header from './Header'

export default function Layout({ children }) {
  return (
    <NextUIProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {children}
      </div>
    </NextUIProvider>
  )
} 