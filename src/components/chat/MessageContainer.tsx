import { useSelectedUser } from "@/store/useSelectedUser"
import ChatBottomBar from "./ChatBottomBar"
import ChatTopbar from "./ChatTopbar"
import MessageList from "./MessageList"
import { useEffect } from "react"

const MessageContainer = () => {
  const {setSelectedUser} = useSelectedUser();
  useEffect(()=>{
      const handleEscape = (e:KeyboardEvent)=>{
        if(e.key === "Escape") setSelectedUser(null)
      }
    document.addEventListener("keydown",handleEscape);
    return ()=> document.removeEventListener(
      "keydown",handleEscape
    )
  },[setSelectedUser])
  return (
    <div className="flex flex-col justify-between w-full h-full">
        <ChatTopbar/>
        <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
            <MessageList/>
            <ChatBottomBar/>
        </div>
      
    </div>
  )
}

export default MessageContainer
