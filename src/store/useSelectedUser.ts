import {create} from 'zustand'

import { User } from '@/db/dummy'

type selectedUserState = {
    selectedUser:User | null;
    setSelectedUser:(user:User | null)=>void;
}


export const useSelectedUser = create<selectedUserState>((set)=>({
    selectedUser:null,
    setSelectedUser:(user:User | null)=>set({selectedUser:user})
}))