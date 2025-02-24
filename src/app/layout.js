import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './(components)/ui/Navigation'
import Footer from './(components)/ui/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HEXEL | Software & Design',
  description: 'Next-gen digital solutions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-hexel-dark text-hexel-light`}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}