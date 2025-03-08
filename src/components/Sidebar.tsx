import { USERS } from "@/db/dummy";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LogOut } from "lucide-react";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const selectedUser = USERS[0];
  const [playClickSound] = useSound('/sounds/mouse-click.mp3')
  const {soundEnabled} = usePreferences()

  return (
    <div className="relative flex flex-col h-full gap-4 data-[collapsed=true]:p-2 max-h-full overflow-auto bg-background pt-4 ">
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
          </div>
        </div>
      )}

      <ScrollArea className="gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {USERS.map((user, idx) =>
          isCollapsed ? (
            <TooltipProvider key={idx}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div onClick={()=>{
                    if(soundEnabled) playClickSound()
                  }}>
                  <Avatar className="my-1 flex justify-center items-center">
                    <AvatarImage src={user.image} alt={user.name} className="border-2 border-white rounded-full w-10 h-10" />
                  </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{user.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-500 transition" 
            onClick={()=>{
              if(soundEnabled) playClickSound()
            }}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.image} alt={user.name} />
              </Avatar>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
          )
        )}
      </ScrollArea>
    {/* logout button */}
    <div className="mx-auto">
        <div className="flex justify-between items-center gap-36 md:px-6 py-2">
            {!isCollapsed && (
                <div className="hidden md:flex gap-2 items-center">
                    <Avatar className="flex justify-center items-center">
                        <AvatarImage 
                            src={'/user-placeholder.png'}
                            alt="avatar"
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 border-2 border-white rounded-full"
                        />
                    </Avatar>
                    <p>{"John Doe"}</p>
                </div>
            )}
            <div className="flex">
                    <LogOut size={22} className="cursor-pointer "/>
            </div>
        </div>
    </div>
    </div>
  );
};

export default Sidebar;
