import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (only used in server components or server actions)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

// Client-side Pusher instance (safe to use in client components)
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
  { 
    cluster: "ap2" 
  }
);
