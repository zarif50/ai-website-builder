import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/api.js'
import toast from "react-hot-toast"
import{useNavigate} from "react-router-dom"
const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {

      const navigate = useNavigate()
    //auth
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    //auth action

    const checkSession = async () => {
        try {
            const { data } = await api.get("/api/auth/me");
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    };

    // Check session on component mount
    useEffect(() => {
        checkSession()
    }, [checkSession]);


    const login = async (email, password) => {
        try {

            const { data } = await api.post("/api/auth/login", { email, password });
            setUser(data.user)
            toast.success("welcome back!")
            navigate("/")
        } catch (err) {
            console.error("login Failed:", err);
            const errMsg = err?.response?.data?.error ||  "Inavlid email or password";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }

    const register = async (name, email, password) => {
        try {

            const { data } = await api.post("/api/auth/register", {name, email, password });
            setUser(data.user)
            toast.success("Account Created Suceesfully!")
            navigate("/")
        } catch (err) {
            console.error("Registration Failed:", err);
            const errMsg = err?.response?.data?.error ||  "Registration failed";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }



    return (
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
}