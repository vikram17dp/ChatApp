"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Avatar, AvatarImage } from "../ui/avatar"
import { useSelectedUser } from "@/store/useSelectedUser"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteMessageAction, deleteMessageForEveryone, getMessages } from "@/actions/message.actions"
import { useEffect, useRef } from "react"
import MessageSkeleton from "../skeletons/MessageSkeleton "
import { MoreVertical, Trash, XIcon as TrashX } from "lucide-react"
import type { Messagess } from "@/actions/message.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { pusherClient } from "@/lib/pusher"

const MessageList = () => {
  const { selectedUser } = useSelectedUser()
  const { user: currentUser, isLoading: isUserLoading } = useKindeBrowserClient()
  const queryClient = useQueryClient()

  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", selectedUser?.id],
    queryFn: async () => {
      if (selectedUser && currentUser) {
        return await getMessages(selectedUser.id, currentUser.id)
      }
      return []
    },
    enabled: !!selectedUser && !!currentUser && !isUserLoading,
  })

  // Deleting a message for me
  const { mutate: deleteMessage } = useMutation({
    mutationFn: deleteMessageAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedUser?.id] })
    },
    onError: (error) => {
      console.error("Failed to delete message:", error)
    },
  })

  // Deleting a message for everyone
  const { mutate: deleteForEveryone } = useMutation({
    mutationFn: deleteMessageForEveryone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedUser?.id] })
    },
    onError: (error) => {
      console.error("Failed to delete message for everyone:", error)
    },
  })

  const handleDeleteMessage = (messageId: number) => {
    console.log("Deleting message with ID:", messageId)
    if (!messageId) {
      console.error("Invalid message ID")
      return
    }
    deleteMessage(messageId.toString())
  }

  const handleDeleteForEveryone = (messageId: number) => {
    console.log("Deleting message for everyone with ID:", messageId)
    if (!messageId) {
      console.error("Invalid message ID")
      return
    }
    deleteForEveryone(messageId.toString())
  }

  // Listen for real-time message deletions
  useEffect(() => {
    if (!currentUser?.id || !selectedUser?.id) return

    const channelName1 = `${currentUser.id}_${selectedUser.id}`.split("__").sort().join("__")
    const channelName2 = `${selectedUser.id}_${currentUser.id}`.split("__").sort().join("__")

    const channel1 = pusherClient.subscribe(channelName1)
    const channel2 = pusherClient.subscribe(channelName2)

    const handleMessageDeleted = (data: { messageId: string; deletedBy: string; deleteForEveryone: boolean }) => {
        console.log("Message deleted event received:", data);
      
        queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Messagess[] | undefined) => {
          if (!oldMessages) return [];
          return oldMessages.filter((msg) => msg.id !== data.messageId);
        });
      };

    channel1.bind("messageDeleted", handleMessageDeleted)
    channel2.bind("messageDeleted", handleMessageDeleted)

    return () => {
      channel1.unbind("messageDeleted", handleMessageDeleted)
      channel2.unbind("messageDeleted", handleMessageDeleted)
      pusherClient.unsubscribe(channelName1)
      pusherClient.unsubscribe(channelName2)
    }
  }, [currentUser?.id, selectedUser?.id, queryClient])

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={messageContainerRef} className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden p-2">
      <AnimatePresence>
        {!isMessagesLoading &&
          messages?.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser?.id
            return (
              <motion.div
                key={message.id || index}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: messages.indexOf(message) * 0.05 + 0.2,
                  },
                }}
                className={cn(
                  "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                  isCurrentUser ? "items-end" : "items-start",
                )}
              >
                <div className="flex gap-3 items-center">
                  {/* Sender Avatar */}
                  {!isCurrentUser && (
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage
                        className="border-2 border-white rounded-full"
                        src={selectedUser?.image || "/user-placeholder.png"}
                        alt="Sender Avatar"
                      />
                    </Avatar>
                  )}

                  {/* Message Content */}
                  {message.messageType === "text" ? (
                    <span className="bg-accent p-3 rounded-md max-w-xs">{message.content}</span>
                  ) : (
                    <img
                      src={message.content || "/image-placeholder.png"}
                      alt="Message Image"
                      className="border p-2 h-40 md:h-52 object-cover rounded-md"
                    />
                  )}

                  {/* Current User Avatar */}
                  {isCurrentUser && (
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage
                        className="border-2 border-white rounded-full"
                        src={currentUser?.picture || "/user-placeholder.png"}
                        alt="User Avatar"
                      />
                    </Avatar>
                  )}

                  {/* Delete Button */}
                  {isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical size={16} className="text-muted-foreground cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteMessage(message.id)}>
                          <Trash size={16} className="mr-2" />
                          Delete for me
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteForEveryone(message.id)}>
                          <TrashX size={16} className="mr-2" />
                          Delete for everyone
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            )
          })}
        {isMessagesLoading && (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageList

