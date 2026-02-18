
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";

type UserContextType = {
    user: string;
    setUser: (user: string) => void;
    selectedProfile: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { user: authUser } = useAuth();
    const [user, setUserState] = useState("Guest");

    useEffect(() => {
        if (authUser) {
            const displayName =
                authUser.displayName || authUser.email?.split("@")[0] || "Account";
            setUserState(displayName);
        } else {
            setUserState("Guest");
        }
    }, [authUser]);

    const setUser = (newUser: string) => {
        setUserState(newUser);
    };

    return (
        <UserContext.Provider value={{ user, setUser, selectedProfile: user }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
