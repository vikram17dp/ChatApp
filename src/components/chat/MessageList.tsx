import { messages, USERS } from '@/db/dummy'
import { cn } from '@/lib/utils'
import {AnimatePresence,motion} from 'framer-motion'
import { Avatar, AvatarImage } from '../ui/avatar';
const MessageList = () => {
    const selectedUser = USERS[0];
    const currentUser = USERS[1];
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <AnimatePresence>
            {
                messages.map((message,index)=>(
                    <motion.div 
                        key={message.id || index}
                        layout
                        initial={
                            {opacity:0,scale:1,y:50,x:0}
                        }
                        animate={ {opacity:1,scale:1,y:0,x:0}}
                        exit={ {opacity:0,scale:1,y:1,x:0}}
                        transition={{
                            opacity:{duration:0.1},
                            layout:{
                                type:"spring",
                                bounce:0.3,
                                duration:messages.indexOf(message) * 0.05 + 0.2
                            }
                        }}
                        style={{
                            originX:0.5,
                            originY:0.5
                        }}
                         className={cn("flex flex-col gap-2 p-4 whitespace-pre-wrap ",
                            message.senderId == currentUser.id ? "items-end" :"items-start"
                         )}
                    >
                        <div className="flex gap-3 items-center">
                            {message.senderId == selectedUser.id &&(
                                <Avatar className='flex justify-center items-center'>
                                    <AvatarImage className='border-2 border-white rounded-full'
                                    src={selectedUser.image}
                                    alt='message img'

                                    />
                                </Avatar>
                            )}
                            {message.messageType == "text" ? (
                                <span className='bg-accent p-3 rounded-md max-w-xs'>{message.content}</span>
                            ) : (
                                <img src={message.content} alt="message img"
                                className='border p-2 h-40 md:h-52 object-cover'
                                />
                            )}

{message.senderId == currentUser.id &&(
                                <Avatar className='flex justify-center items-center'>
                                    <AvatarImage className='border-2 border-white rounded-full'
                                    src={currentUser.image}
                                    alt='message img'

                                    />
                                </Avatar>
                            )}
                        </div>
                    </motion.div>
                ))
            }
        </AnimatePresence>
      
    </div>
  )
}

export default MessageList
