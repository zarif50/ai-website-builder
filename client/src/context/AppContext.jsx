import { createContext, useContext, useState, useEffect,useCallback } from 'react'
import api from '../api/api.js'
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {

    const navigate = useNavigate()
    //auth
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    //states
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState([true]);
    const [activeProject, setActiveProject] = useState([null]);
    const [loadingActiveProject, setLoadingActiveProject] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [generatingProject, setGeneratingProject] = useState(false);
    const [activeFile, setActiveFile] = useState("/App.js");
    const [showCode, setShowCode] = useState(false);


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
            const errMsg = err?.response?.data?.error || "Inavlid email or password";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }
    const logout = async () => {
        try {
            await api.post("/api/auth/logout")
            setUser(null)
            setProjects([])
            setActiveProject(null)
            toast.success("Logged out Successfully")
            navigate("/login")
        } catch (error) {
            console.error("Logout Failed:", err)
            toast.error("Logout Failed")
        }
    }

    //projects action
    const loadProjects = async () => {
        if (!user) return;
        try {
            const { data } = await api.get("/api/projects")
            setProjects(data)
        } catch (err) {
            console.error("Failed to list projects", err);
            toast.error("Failed to load Projects list");

        } finally {
            setLoadingProjects(false);
        }
    }

    const loadProject = async (id, silent = false) => {
        if (!user) return;
        if (!silent) setLoadingActiveProject(true)
        try {
            const { data } = await api.get(`/api/projects/${id}`)
            setActiveProject(data);
            const files = Object.keys(data.files);
            if (files.length > 0) {
                setActiveFile((prev) => {
                    if (files.includes(prev)) return prev;
                    if (files.includes("/App.js")) return "App/js";
                    return files[0]
                })
            }
        } catch (err) {
            console.error("Failed to load Projects:", err);
            if (!silent) {
                toast.error("Failed to load Projects details");
                navigate("/");
            }
        } finally {
            if (!silent) setLoadingActiveProject(false)
        }
    }
    ///automatically poll active project status(pend or generating)
    useEffect(() => {
        if (!activeProject?._id || user) return;

        const isOngoing = activeProject.status === "generating" || activeProject.status === "pending" || activeProject.status ===
            "revising";

        if (isOngoing) {
            setChatLoading(true);
            const interval = setInterval(() => {
                loadProject(activeProject._id, true)
            }, 2000);
            return () => clearInterval(interval)
        } else {
            setChatLoading(false);
        }

    }, [activeProject?._id, activeProject?.status, loadProject, user])

    const handleGenerate = useCallback(
        async (prompt) => {
            if (!user) return;
            setGeneratingProject(true);
            try {
                const { data } = await api.post("/api/projects", { prompt });
                toast.success("Ai Agent is planning structure...")
                navigate(`/buider/${data.id}`);
            } catch (err) {
                console.error("Failed to generate projects:", err);
                toast.error(err?.response?.data?.error || " Failed to generate project");
            } finally {
                setGeneratingProject(false);
            }

        }, [navigate, user]
    )

    const handleDelete = useCallback(
        async (id) => {
            if (!user) return;
            try {
                await api.delete(`/api/projects/${id}`);
                setProjects((prev) => prev.filter((p) => p._id !== id))
                toast.success("Project deleted successfully");
            }
            catch (err) {
                console.error("Failed to generate projects:", err);
                toast.error("failed to delete project");
            }

        }, [user]
    )


    const register = async (name, email, password) => {
        try {

            const { data } = await api.post("/api/auth/register", { name, email, password });
            setUser(data.user)
            toast.success("Account Created Suceesfully!")
            navigate("/")
        } catch (err) {
            console.error("Registration Failed:", err);
            const errMsg = err?.response?.data?.error || "Registration failed";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }



    return (
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register,
            projects,
            loadProjects,
            activeProject,
            loadingActiveProject,
            chatLoading,
            generatingProject,
            activeFile,
            showCode,
            setActiveFile,
            setShowCode,
            loadProjects,
            loadProject,
            handleGenerate,
            handleDelete

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