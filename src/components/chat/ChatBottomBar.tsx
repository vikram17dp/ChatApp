"use client"

import type React from "react"
import Image from "next/image"
import { AnimatePresence } from "framer-motion"
import { ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import useSound from "use-sound"
import { usePreferences } from "@/store/usePreferences"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendMessageAction } from "@/actions/message.actions"
import { useSelectedUser } from "@/store/useSelectedUser"
import EmojiPicker from "./EmojiPicker"
import { CldUploadWidget, type CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import type { Message } from "@/db/dummy"
import { pusherClient } from "@/lib/pusher" // Remove pusherServer import

const ChatBottomBar = () => {
  const [message, setMessage] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { soundEnabled } = usePreferences()
  const [playSound1] = useSound("/sounds/keystroke1.mp3")
  const [playSound2] = useSound("/sounds/keystroke2.mp3")
  const [playSound3] = useSound("/sounds/keystroke3.mp3")
  const [playSound4] = useSound("/sounds/keystroke4.mp3")
  const [playNotifcationSound] = useSound("/sounds/notification.mp3")
  const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4]

  const { selectedUser } = useSelectedUser()
  const [imgUrl, setImgUrl] = useState("")
  const { user: currentUser } = useKindeBrowserClient()
  const queryClient = useQueryClient()

  const playRandomKeyStrokeSound = () => {
    const randomIndex = Math.floor(Math.random() * playSoundFunctions.length)
    if (soundEnabled) playSoundFunctions[randomIndex]()
  }

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: sendMessageAction,
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault()
      setMessage(message + "\n")
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser?.id) return
    sendMessage({
      content: message,
      messageType: "text",
      receiverId: selectedUser.id,
    })
    setMessage("")
    textAreaRef.current?.focus()
  }

  const handleThumbsUp = () => {
    if (!selectedUser?.id) {
      console.error("No selected user found:", selectedUser)
      return
    }

    console.log("Sending thumbs up to:", selectedUser.id)
    sendMessage({
      content: "👍",
      messageType: "text",
      receiverId: selectedUser.id,
    })
  }

  useEffect(() => {
    if (!currentUser?.id || !selectedUser?.id) return

    // Create two channel names to listen to both directions of messages
    const channelName1 = `${currentUser.id}_${selectedUser.id}`.split("__").sort().join("__")
    const channelName2 = `${selectedUser.id}_${currentUser.id}`.split("__").sort().join("__")

    console.log("Subscribing to channels:", channelName1, channelName2)

    // Subscribe to both channels
    const channel1 = pusherClient.subscribe(channelName1)
    const channel2 = pusherClient.subscribe(channelName2)

    const handleNewMessage = (data: { message: Message }) => {
      console.log("New message received:", data.message)

      queryClient.setQueryData(["messages", selectedUser.id], (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return [data.message]

        // Check if message already exists to prevent duplicates
        const messageExists = oldMessages.some(
          (msg) =>
            msg.senderId === data.message.senderId &&
            msg.content === data.message.content &&
            msg.timestamp === data.message.timestamp,
        )

        if (messageExists) return oldMessages
        return [...oldMessages, data.message]
      })
      if(soundEnabled && data.message.senderId != currentUser?.id){
        playNotifcationSound();
      }
    }

    // Bind event handlers to both channels
    channel1.bind("newMessage", handleNewMessage)
    channel2.bind("newMessage", handleNewMessage)
    return () => {
      // Clean up both channels
      channel1.unbind("newMessage", handleNewMessage)
      channel2.unbind("newMessage", handleNewMessage)
      pusherClient.unsubscribe(channelName1)
      pusherClient.unsubscribe(channelName2)
    }
  }, [currentUser?.id, selectedUser?.id, queryClient,playNotifcationSound,soundEnabled])

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      {!message.trim() && (
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={(result, { widget }) => {
            setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url)
            widget.close()
          }}
        >
          {({ open }) => (
            <ImageIcon size={20} className="cursor-pointer text-muted-foreground" onClick={() => open()} />
          )}
        </CldUploadWidget>
      )}
      <Dialog open={!!imgUrl} onOpenChange={(open) => !open && setImgUrl("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center relative h-96 w-full mx-auto">
            <Image src={imgUrl || "/placeholder.svg"} alt="Image Preview" fill className="object-contain" />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                if (!selectedUser?.id) return
                sendMessage({
                  content: imgUrl,
                  messageType: "image",
                  receiverId: selectedUser.id,
                })
                setImgUrl("")
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key="textarea"
            layout
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              opacity: { duration: 0.5 },
              layout: {
                type: "spring",
                bounce: 0.15,
              },
            }}
            className="w-full"
          >
            <Textarea
              ref={textAreaRef}
              autoComplete="off"
              placeholder="Aa"
              rows={1}
              className="w-full rounded-full flex items-center h-9 resize-none overflow-hidden bg-background min-h-0"
              value={message}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setMessage(e.target.value)
                playRandomKeyStrokeSound()
              }}
            />
            <div className="absolute right-2 bottom-0.5">
              <EmojiPicker
                onChange={(emoji) => {
                  setMessage(message + emoji)
                  if (textAreaRef.current) {
                    textAreaRef.current.focus()
                  }
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {message.trim() ? (
          <motion.div key="send-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
              variant="ghost"
              size="icon"
              onClick={handleSendMessage}
              disabled={isPending}
            >
              {isPending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <SendHorizontal size={20} className="text-muted-foreground" />
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="thumbs-up-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
              variant="ghost"
              size="icon"
              onClick={handleThumbsUp}
              disabled={isPending || !selectedUser?.id}
            >
              {isPending ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <ThumbsUp size={20} className="text-muted-foreground cursor-pointer" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatBottomBar

