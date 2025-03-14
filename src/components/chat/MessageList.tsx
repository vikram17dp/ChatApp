import { cn } from '@/lib/utils';
 import { AnimatePresence, motion } from 'framer-motion';
 import { Avatar, AvatarImage } from '../ui/avatar';
 import { useSelectedUser } from '@/store/useSelectedUser';
 import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
 import { useQuery } from '@tanstack/react-query';
 import { getMessages } from '@/actions/message.actions';
 import { useEffect, useRef } from 'react';
 import MessageSkeleton from '../skeletons/MessageSkeleton ';

 const MessageList = () => {
  const { selectedUser } = useSelectedUser();
  const { user: currentUser, isLoading: isUserLoading } = useKindeBrowserClient();
  const messageContainerRef= useRef<HTMLDivElement>(null)
  const { data: messages = [], isLoading:isMessagesLoading } = useQuery({
      queryKey: ['messages', selectedUser?.id],
      queryFn: async () => {
          if (selectedUser && currentUser) {
              return await getMessages(selectedUser.id, currentUser.id);
          }
          return [];
      },
      enabled: !!selectedUser && !!currentUser && !isUserLoading
  });
  useEffect(()=>{
    if(messageContainerRef.current){
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
},[messages])
return (
    <div ref={messageContainerRef} className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden p-2">
        <AnimatePresence>
            {!isMessagesLoading &&  messages?.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser?.id;
                return (
                    <motion.div
                        key={message.id || index} // Use a unique ID if available
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                            opacity: { duration: 0.1 },
                            layout: {
                                type: 'spring',
                                bounce: 0.3,
                                duration: messages.indexOf(message) * 0.05 + 0.2
                            }
                        }}
                        className={cn(
                            'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                            isCurrentUser ? 'items-end' : 'items-start'
                        )}
                        >
                        <div className="flex gap-3 items-center">
                            {/* Sender Avatar */}
                            {!isCurrentUser && (
                                <Avatar className="flex justify-center items-center">
                                    <AvatarImage
                                        className="border-2 border-white rounded-full"
                                        src={selectedUser?.image || '/user-placeholder.png'}
                                        alt="Sender Avatar"
                                    />
                                </Avatar>
                            )}

                            {/* Message Content */}
                            {message.messageType === 'text' ? (
                                <span className="bg-accent p-3 rounded-md max-w-xs">{message.content}</span>
                            ) : (
                                <img
                                    src={message.content || '/image-placeholder.png'}
                                    alt="Message Image"
                                    className="border p-2 h-40 md:h-52 object-cover rounded-md"
                                />
                              )}
 
                              {/* Current User Avatar */}
                              {isCurrentUser && (
                                  <Avatar className="flex justify-center items-center">
                                      <AvatarImage
                                          className="border-2 border-white rounded-full"
                                          src={currentUser?.picture || '/user-placeholder.png'}
                                          alt="User Avatar"
                                      />
                                  </Avatar>
                              )}
                          </div>
                      </motion.div>
                  );
              })}
              {
                  isMessagesLoading && (
                      <>
                          <MessageSkeleton/>
                          <MessageSkeleton/>

                          <MessageSkeleton/>
                      </>
                  )
              }
          </AnimatePresence>
      </div>
  );
};
export default MessageList;