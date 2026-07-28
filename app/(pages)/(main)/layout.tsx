import Link from "next/link"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <main>
            
          <Link href={"www.github.com/0Nsingh/streamtracker.git"}><h1>Github Repo</h1></Link>
            {children}
            
        </main>
  )
}