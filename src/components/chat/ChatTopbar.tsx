import { USERS } from "@/db/dummy"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Info, X } from "lucide-react"
import { useSelectedUser } from "@/store/useSelectedUser"

const ChatTopbar = () => {
    const {setSelectedUser,selectedUser} = useSelectedUser()
  return (
    <div className="w-full h-15 flex p-4 justify-between items-center border-b">
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src={selectedUser?.image ||'/user-placeholder.png'}
                alt="User Img"
                className="w-10 h-10 object-cover rounded-full"
                />               
            </Avatar>
            <span className="font-medium">{selectedUser?.name}</span>
        </div>
        <div className="flex gap-2">
            <Info className="text-muted-foreground cursor-pointer hover:text-primary"/>
            <X className="text-muted-foreground cursor-pointer hover:text-primary"
                onClick={()=>setSelectedUser(null)}
            />
        </div>
      
    </div>
  )
}

export default ChatTopbar
