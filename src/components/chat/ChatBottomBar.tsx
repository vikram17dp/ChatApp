"use client"

import type React from "react"

import { AnimatePresence } from "framer-motion"
import { ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import useSound from "use-sound"
import { usePreferences } from "@/store/usePreferences"
import { useMutation } from "@tanstack/react-query"
import { sendMessageAction } from "@/actions/message.actions"
import { useSelectedUser } from "@/store/useSelectedUser"
import EmojiPicker from "./EmojiPicker"

const ChatBottomBar = () => {
  const [message, setMessage] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { soundEnabled } = usePreferences()
  const [playSound1] = useSound("/sounds/keystroke1.mp3")
  const [playSound2] = useSound("/sounds/keystroke2.mp3")
  const [playSound3] = useSound("/sounds/keystroke3.mp3")
  const [playSound4] = useSound("/sounds/keystroke4.mp3")
  const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4]

  const { selectedUser } = useSelectedUser()

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

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      {!message.trim() && <ImageIcon size={20} className="cursor-pointer text-muted-foreground" />}

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

