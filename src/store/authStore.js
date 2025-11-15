import { create } from "zustand";
import { persist } from "zustand/middleware";

const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });

        try {
          // First try JSONP (works with CORS)
          const success = await get().loginWithJsonp(username, password);
          if (success) return true;

          // Fallback to POST if JSONP fails
          const response = await fetch(
            `${BACKEND_URL}?action=login&username=${encodeURIComponent(
              username
            )}&password=${encodeURIComponent(password)}`,
            {
              method: "GET",
              mode: "no-cors",
            }
          );

          const result = await response.json();

          if (result.success && result.user) {
            set({
              isAuthenticated: true,
              user: result.user,
              isLoading: false,
            });
            return true;
          } else {
            throw new Error(result.error || "Login failed");
          }
        } catch (error) {
          set({ isLoading: false });
          console.error("Login error:", error);
          return false;
        }
      },

      loginWithJsonp: async (username, password) => {
        return new Promise((resolve) => {
          const callbackName = `jsonp_callback_${Date.now()}`;
          const script = document.createElement("script");

          window[callbackName] = (result) => {
            document.head.removeChild(script);
            delete window[callbackName];

            if (result.success && result.user) {
              set({
                isAuthenticated: true,
                user: {
                  id: result.user.id,
                  username: result.user.username,
                  name: result.user.name || result.user.username,
                  role: result.user.role,
                  page: result.user.page,
                  machine: result.user.machine, // ✅ Add this line
                  department: result.user.department, // ✅ Add this line
                },
                isLoading: false,
              });
              resolve(true);
            } else {
              set({ isLoading: false });
              console.error(
                "JSONP Login failed:",
                result.error || "Unknown error"
              );
              resolve(false);
            }
          };

          script.onerror = () => {
            document.head.removeChild(script);
            delete window[callbackName];
            set({ isLoading: false });
            console.error("JSONP request failed");
            resolve(false);
          };

          script.src = `${BACKEND_URL}?action=login&username=${encodeURIComponent(
            username
          )}&password=${encodeURIComponent(password)}&callback=${callbackName}`;
          document.head.appendChild(script);
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      },

      getCurrentUser: () => {
        return get().user;
      },

      hasRole: (role) => {
        const user = get().user;
        return user && user.role === role;
      },

      isAdmin: () => {
        const user = get().user;
        return user && user.role === "admin";
      },
    }),
    {
      name: "o2d-auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
