"use server"
import { Message } from "@/db/dummy";
import { redis } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


type SendMessageActionArgs = {
	content: string;
	receiverId: string;
	messageType: "text" | "image" | "video";
};
export async function sendMessageAction({content,messageType,receiverId}:SendMessageActionArgs){

    const {getUser} = getKindeServerSession()
    const user = await getUser();

    if(!user) return {success:false,message:"User not authenticated"}

    const senderId  = user.id;

    const converstionId = `conversation:${[senderId,receiverId].sort().join(":")}`


    // the issue with this has been explained in the tutorial, we need to sort the ids to make sure the conversation id is always the same
	// john, jane
	// 123,  456

	// john sends a message to jane
	// senderId: 123, receiverId: 456
	// `conversation:123:456`

	// jane sends a message to john
	// senderId: 456, receiverId: 123
	// conversation:456:123

    const conversationExists = await redis.exists(converstionId)
    
    // if not
    if(!conversationExists){
        await redis.hset(converstionId,{
            participant1:senderId,
            participant2:receiverId
        })
        await redis.sadd(`user:${senderId}:conversations`,converstionId)
        await redis.sadd(`user:${receiverId}:conversations`,converstionId)
    }

    // generate an unique message id

    const messageId = `message:${Date.now()}:${Math.random().toString(36).substring(2,9)}`
    const timeStamp = Date.now();

    await redis.hset(messageId,{
        senderId,
        content,
        timeStamp,
        messageId
    })
    await redis.zadd(`${converstionId}:messages`,{score:timeStamp,member:JSON.stringify(messageId)})

    return {sucess:true,converstionId,messageId}
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