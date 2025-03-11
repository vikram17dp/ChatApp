"use server";

import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

type SendMessageActionArgs = {
  content: string;
  receiverId: string;
  messageType: "text" | "image" | "video";
};

export async function sendMessageAction({ content, messageType, receiverId }: SendMessageActionArgs) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return { success: false, message: "User not authenticated" };

  const senderId = user.id;

  // Ensure consistent conversation ID
  const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`;

  // Check if conversation exists
  const conversationExists = await redis.exists(conversationId);


     // the issue with this has been explained in the tutorial, we need to sort the ids to make sure the conversation id is always the same
	// john, jane
	// 123,  456

	// john sends a message to jane
	// senderId: 123, receiverId: 456
	// `conversation:123:456`

	// jane sends a message to john
	// senderId: 456, receiverId: 123
	// conversation:456:123

  if (!conversationExists) {
    await redis.hset(conversationId, {
      participant1: senderId,
      participant2: receiverId
    });

    // Add conversation to both users' lists
    await redis.sadd(`user:${senderId}:conversations`, conversationId);
    await redis.sadd(`user:${receiverId}:conversations`, conversationId);
  }

  // Generate unique message ID
  const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
  const timeStamp = Date.now();

  // Store message in Redis
  await redis.hset(messageId, {
    senderId,
    receiverId,
    content,
    timeStamp,
    messageType
  });

  // Add message to sorted set for ordered retrieval
  await redis.zadd(`${conversationId}:messages`, { score: timeStamp, member: messageId });

  return { success: true, conversationId, messageId };
}

// Function to retrieve messages for a conversation
export async function getMessages(selectedUserId: string, currentUserId: string) {
    try {
      if (!selectedUserId || !currentUserId) return [];
  
      // Ensure consistent conversation ID
      const conversationId = `conversation:${[selectedUserId, currentUserId].sort().join(":")}`;
  
      // Retrieve message IDs from sorted set
      const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);
      if (messageIds.length === 0) return [];
  
      // Use pipeline to batch fetch messages
      const pipeline = redis.pipeline();
      messageIds.forEach((messageId) => pipeline.hgetall(String(messageId))); // ✅ Fix applied
  
      const messages = (await pipeline.exec()) as Message[];
  
      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }
  
