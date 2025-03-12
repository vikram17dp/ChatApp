"use server"
import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { pusherClient,pusherServer } from "@/lib/pusher";

type SendMessageActionArgs = {
	content: string;
	receiverId: string;
	messageType: "text" | "image";
};
export async function sendMessageAction({ content, messageType, receiverId }: SendMessageActionArgs) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
  
    if (!user) return { success: false, message: "User not authenticated" };
  
    const senderId = user.id;
  
    const conversationId = `conversation:${[senderId, receiverId].sort().join(":")}`;
  
    const conversationExists = await redis.exists(conversationId); // Fix this line
  
    if (!conversationExists) { // Fix this line
      await redis.hset(conversationId, { // Fix this line
        participant1: senderId,
        participant2: receiverId,
      });
  
      await redis.sadd(`user:${senderId}:conversations`, conversationId); // Fix this line
      await redis.sadd(`user:${receiverId}:conversations`, conversationId); // Fix this line
    }
  
    const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();
  
    await redis.hset(messageId, {
      senderId,
      content,
      timestamp,
      messageType,
    });
  
    await redis.zadd(`${conversationId}:messages`, { score: timestamp, member: JSON.stringify(messageId) });

    const channelName = `${senderId}_${receiverId}`.split('__').sort().join('__');

    await pusherServer?.trigger(channelName,'newMessage',{
        message:{senderId,content,timestamp,messageType}
    })
  
    return { success: true, conversationId, messageId };
  }

  export async function getMessages(selectedUserId: string, currentUserId: string) {
    try {
      if (!selectedUserId || !currentUserId) return [];
  
      const conversationId = `conversation:${[selectedUserId, currentUserId].sort().join(":")}`; // Fix this line
  
      const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1); // Fix this line
  
      if (messageIds.length === 0) return [];
  
      const pipeline = redis.pipeline();
      messageIds.forEach((messageId) => pipeline.hgetall(messageId as string));
      const messages = (await pipeline.exec()) as Message[];
  
      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }