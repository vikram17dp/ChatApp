"use server"
import type { Message } from "@/db/dummy"
import { redis } from "@/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { pusherServer } from "@/lib/pusher"

type SendMessageActionArgs = {
  content: string
  receiverId: string
  messageType: "text" | "image"
}


export async function sendMessageAction({ content, messageType, receiverId }: SendMessageActionArgs) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) return { success: false, message: "User not authenticated" }

  const senderId = user.id

  const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`

  const conversationExists = await redis.exists(conversationId)

  if (!conversationExists) {
    await redis.hset(conversationId, {
      participant1: senderId,
      participant2: receiverId,
    })

    await redis.sadd(`user:${senderId}:conversations`, conversationId)
    await redis.sadd(`user:${receiverId}:conversations`, conversationId)
  }

  const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`
  const timestamp = Date.now()

  const messageData = {
    senderId,
    content,
    timestamp,
    messageType,
  }

  await redis.hset(messageId, messageData)

  await redis.zadd(`${conversationId}:messages`, { score: timestamp, member: messageId })

  // Create a consistent channel name for both sender and receiver
  const channelName = `${senderId}_${receiverId}`.split("__").sort().join("__")

  // Trigger the message event with the complete message data
  await pusherServer.trigger(channelName, "newMessage", {
    message: messageData,
  })

  return { success: true, conversationId, messageId }
}

export async function getMessages(selectedUserId: string, currentUserId: string) {
  try {
    if (!selectedUserId || !currentUserId) return []

    const conversationId = `conversation:${[selectedUserId, currentUserId].sort().join(":")}`

    const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1)

    if (messageIds.length === 0) return []

    const pipeline = redis.pipeline()
    messageIds.forEach((messageId) => pipeline.hgetall(messageId as string))
    const messages = (await pipeline.exec()) as Message[]

    return messages
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}


