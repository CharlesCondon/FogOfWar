import { Dispatch, SetStateAction, createContext } from 'react';
import { User } from '@/types';

interface UserContextType {
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>> | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);