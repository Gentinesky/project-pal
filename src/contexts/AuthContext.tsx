import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "user" | "admin" | "landlord";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  blocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  allUsers: User[];
  blockUser: (userId: string, blocked: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: User[] = [
  { id: "admin-1", name: "Admin", email: "admin@hunt.co.ke", role: "admin" },
];

const DEMO_PASSWORDS: Record<string, string> = {
  "admin@hunt.co.ke": "admin123",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [passwords, setPasswords] = useState<Record<string, string>>(DEMO_PASSWORDS);

  const login = useCallback(
    (email: string, password: string): boolean => {
      const found = users.find((u) => u.email === email);
      if (found && passwords[email] === password) {
        if (found.blocked) return false;
        setUser(found);
        return true;
      }
      return false;
    },
    [users, passwords]
  );

  const signup = useCallback(
    (name: string, email: string, password: string, role: UserRole): boolean => {
      if (users.find((u) => u.email === email)) return false;
      const newUser: User = { id: `user-${Date.now()}`, name, email, role };
      setUsers((prev) => [...prev, newUser]);
      setPasswords((prev) => ({ ...prev, [email]: password }));
      setUser(newUser);
      return true;
    },
    [users]
  );

  const logout = useCallback(() => setUser(null), []);

  const blockUser = useCallback((userId: string, blocked: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, blocked } : u)));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAdmin: user?.role === "admin",
        isLoggedIn: !!user,
        allUsers: users,
        blockUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
