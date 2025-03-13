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
export interface Messagess {
  id: string;
  senderId: string;
  content: string;
  messageType: "text" | "image";
  timestamp: string;
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


// for deleting an messages
export async function deleteMessageAction(messageId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    // First, check if the message exists and belongs to the user
    const message = await redis.hgetall(messageId);

    if (!message || Object.keys(message).length === 0) {
      console.error("Message not found:", messageId);
      return { success: false, message: "Message not found" };
    }

    if (message.senderId !== user.id) {
      console.error("Unauthorized: User cannot delete this message");
      return { success: false, message: "You can only delete your own messages" };
    }

    // Find which conversation this message belongs to
    const userConversations = await redis.smembers(`user:${user.id}:conversations`);

    let conversationId = null;
    let otherParticipantId = null;

    // Find which conversation contains this message
    for (const convId of userConversations) {
      const isMember = await redis.zscore(`${convId}:messages`, messageId);
      if (isMember !== null) {
        conversationId = convId;

        // Get the other participant
        const conversation = await redis.hgetall(convId);
        if (!conversation || Object.keys(conversation).length === 0) {
          console.error("Conversation data not found for:", convId);
          continue;
        }

        otherParticipantId =
          conversation.participant1 === user.id ? conversation.participant2 : conversation.participant1;

        break;
      }
    }

    if (!conversationId) {
      console.error("Conversation not found for message:", messageId);
      return { success: false, message: "Conversation not found" };
    }

    // Remove the message from the conversation's message list
    await redis.zrem(`${conversationId}:messages`, messageId);

    // Delete the message itself
    await redis.del(messageId);

    // Notify both participants about the deletion via Pusher
    if (otherParticipantId) {
      const channelName = `${user.id}_${otherParticipantId}`.split("__").sort().join("__");

      await pusherServer.trigger(channelName, "messageDeleted", {
        messageId,
        deletedBy: user.id,
        deleteForEveryone: true,
      });
    }

    return { success: true, message: "Message deleted successfully" };
  } catch (error) {
    console.error("Error deleting message:", error, messageId);
    return { success: false, message: "Failed to delete message" };
  }
}
export async function deleteMessageForEveryone(messageId: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    // First, check if the message exists and belongs to the user
    const message = await redis.hgetall(messageId);

    if (!message || Object.keys(message).length === 0) {
      return { success: false, message: "Message not found" };
    }

    if (message.senderId !== user.id) {
      return { success: false, message: "You can only delete your own messages for everyone" };
    }

    // Find which conversation this message belongs to
    const userConversations = await redis.smembers(`user:${user.id}:conversations`);

    let conversationId = null;
    let otherParticipantId = null;

    for (const convId of userConversations) {
      const isMember = await redis.zscore(`${convId}:messages`, messageId);
      if (isMember !== null) {
        conversationId = convId;

        // Get the other participant
        const conversation = await redis.hgetall(convId);
        if (!conversation || Object.keys(conversation).length === 0) {
          console.error("Conversation data not found for:", convId);
          continue;
        }

        otherParticipantId =
          conversation.participant1 === user.id ? conversation.participant2 : conversation.participant1;

        break;
      }
    }

    if (!conversationId) {
      return { success: false, message: "Conversation not found" };
    }

    // Remove the message from the conversation's message list
    await redis.zrem(`${conversationId}:messages`, messageId);

    // Delete the message itself
    await redis.del(messageId);

    // Notify both participants about the deletion via Pusher
    if (otherParticipantId) {
      const channelName = `${user.id}_${otherParticipantId}`.split("__").sort().join("__");

      await pusherServer.trigger(channelName, "messageDeleted", {
        messageId,
        deletedBy: user.id,
        deleteForEveryone: true,
      });
    }

    return { success: true, message: "Message deleted for everyone" };
  } catch (error) {
    console.error("Error deleting message for everyone:", error);
    return { success: false, message: "Failed to delete message" };
  }
}