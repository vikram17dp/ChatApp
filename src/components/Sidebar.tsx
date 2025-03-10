import { User, USERS } from "@/db/dummy";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useSelectedUser } from "@/store/useSelectedUser";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface SidebarProps {
  isCollapsed: boolean,
  users: User[]
}

const Sidebar = ({ isCollapsed, users }: SidebarProps) => {
  const [playClickSound] = useSound('/sounds/mouse-click.mp3');
  const { soundEnabled } = usePreferences();
  const { setSelectedUser, selectedUser } = useSelectedUser();
  const { user } = useKindeBrowserClient();

  return (
    <div className="relative flex flex-col h-full gap-4 data-[collapsed=true]:p-2 max-h-full overflow-auto bg-background pt-4">
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
          </div>
        </div>
      )}

      <ScrollArea className="gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {users.map((user, idx) =>
          isCollapsed ? (
            <TooltipProvider key={idx}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div onClick={() => {
                    if (soundEnabled) playClickSound();
                    setSelectedUser(user);
                  }}>
                    <Avatar className="my-1 flex justify-center items-center min-w-[3rem] min-h-[3rem]">
                      <AvatarImage src={user?.image || "/user-placeholder.png"} alt={user.name} className="border-2 border-white rounded-full w-10 h-10" />
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{user.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-500 transition"
              onClick={() => {
                if (soundEnabled) playClickSound();
                setSelectedUser(user);
              }}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.image || '/user-placeholder.png'} alt={user.name} />
              </Avatar>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
          )
        )}
      </ScrollArea>

      {/* Logout Section */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-between"} items-center px-2 md:px-4 py-2`}>
          {!isCollapsed && (
            <div className="flex gap-2 items-center">
              <Avatar className="flex justify-center items-center">
                <AvatarImage
                  src={user?.picture || "/user-placeholder.png"}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 border-2 border-white rounded-full"
                />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm truncate max-w-[120px]">
                {user?.given_name || ""} {user?.family_name || ""}
              </p>
            </div>
          )}
          <LogoutLink className={`flex ${isCollapsed ? "" : "ml-2"}`}>
            <LogOut size={22} className="cursor-pointer" />
          </LogoutLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
