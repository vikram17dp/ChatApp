export interface Message {
	id: number;
	senderId: string;
	content: string;
	messageType: "text" | "image" | "video" ;
}

export interface User {
	id: string;
	name: string;
	email: string;
	image: string;
}


export const USERS = [
    {
      id: "1",
      image: "/avatars/user4.png",
      name: "Alice Johnson",
      email: "alicejohnson@gmail.com",
    },
    {
      id: "2",
      image: "/avatars/user3.png",
      name: "John Doe",
      email: "johndoe@gmail.com",
    },
    {
      id: "3",
      image: "/avatars/user2.png",
      name: "Elizabeth Smith",
      email: "elizabeth@gmail.com",
    },
    {
      id: "4",
      image: "/avatars/user4.png",
      name: "John Smith",
      email: "johnsmith@gmail.com",
    },
    {
      id: "5",
      image: "/avatars/user3.png",
      name: "Jane Doe",
      email: "janedoe@gmail.com",
    },
    {
      id: "6",
      image: "/avatars/user2.png",
      name: "Michael Brown",
      email: "michaelbrown@gmail.com",
    },
    {
      id: "7",
      image: "/avatars/user4.png",
      name: "Emily Davis",
      email: "emilydavis@gmail.com",
    },
    {
      id: "8",
      image: "/avatars/user3.png",
      name: "Daniel Wilson",
      email: "danielwilson@gmail.com",
    },
    {
      id: "9",
      image: "/avatars/user2.png",
      name: "Sophia Martinez",
      email: "sophiamartinez@gmail.com",
    },
    {
      id: "10",
      image: "/avatars/user4.png",
      name: "Matthew Anderson",
      email: "matthewanderson@gmail.com",
    },
    {
      id: "11",
      image: "/avatars/user3.png",
      name: "Olivia Thomas",
      email: "oliviathomas@gmail.com",
    },
    {
      id: "12",
      image: "/avatars/user2.png",
      name: "James White",
      email: "jameswhite@gmail.com",
    },
    {
      id: "13",
      image: "/avatars/user4.png",
      name: "Charlotte Harris",
      email: "charlotteharris@gmail.com",
    },
    {
      id: "14",
      image: "/avatars/user3.png",
      name: "William Clark",
      email: "williamclark@gmail.com",
    },
    {
      id: "15",
      image: "/avatars/user2.png",
      name: "Ava Lewis",
      email: "avalewis@gmail.com",
    },
  ];
  

export const messages = [
	{
		id: 1,
		senderId: USERS[0].id,
		content: "Hello",
		messageType: "text",
	},
	{
		id: 2,
		senderId: USERS[1].id,
		content: "Hi",
		messageType: "text",
	},
	{
		id: 3,
		senderId: USERS[0].id,
		content: "How are you?",
		messageType: "text",
	},
	{
		id: 4,
		senderId: USERS[1].id,
		content: "I'm good",
		messageType: "text",
	},
	{
		id: 5,
		senderId: USERS[0].id,
		content: "What are you doing?",
		messageType: "text",
	},
	{
		id: 6,
		senderId: USERS[1].id,
		content: "Nothing much",
		messageType: "text",
	},
	{
		id: 7,
		senderId: USERS[0].id,
		content: "Cool",
		messageType: "text",
	},
	{
		id: 8,
		senderId: USERS[1].id,
		content: "Yeah",
		messageType: "text",
	},
	{
		id: 9,
		senderId: USERS[0].id,
		content: "Bye",
		messageType: "text",
	},
	{
		id: 10,
		senderId: USERS[1].id,
		content: "Bye",
		messageType: "text",
	},
] as Message[];