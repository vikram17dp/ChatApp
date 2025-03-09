import ChatLayout from "@/components/chat/ChatLayout"
import PreferencesTab from "@/components/PreferencesTab"
import type { User } from "@/db/dummy"
import { redis } from "@/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function getUsers(): Promise<User[]> {
  try {
    const userKeys: string[] = []
    let cursor = 0


    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: "user:*",
        type: "hash",
        count: 1000,
      })

      userKeys.push(...keys)
      cursor = Number(nextCursor)
    } while (cursor !== 0)

    if (userKeys.length === 0) return []


    const { getUser } = getKindeServerSession()
    const currentUser = await getUser()

    if (!currentUser) return []

    const pipeline = redis.pipeline()
    userKeys.forEach((key) => pipeline.hgetall(key))
    const results = (await pipeline.exec()) as User[]

    
    return results.filter((user) => user && user.id && user.id !== currentUser.id)
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession()


  if (!(await isAuthenticated())) {
    return redirect("/auth")
  }


  const users = await getUsers()


  const cookieStore = await cookies()
  const layoutCookie = cookieStore.get("react-resizable-panels:layout")
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie.value) : undefined

  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 md:px-24 gap-4">
      <PreferencesTab />

      {/* Background pattern */}
      <div
        className="absolute top-0 z-[-2] h-screen w-screen dark:bg-[#000000] dark:bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] 
        dark:bg-[size:20px_20px] bg-[#ffffff] bg-[radial-gradient(#00000033_1px,#ffffff_1px)] bg-[size:20px_20px]"
        aria-hidden="true"
      />

      {/* Chat app container */}
      <div className="z-10 border rounded-lg max-w-6xl w-full min-h-[85vh] text-sm lg:flex">
        <ChatLayout defaultLayout={defaultLayout} users={users} />
      </div>
    </main>
  )
}

