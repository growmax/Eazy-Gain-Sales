import { jwtDecode, setSession } from "@/utils/utils";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { AuthContext } from "../context/auth-context";
import axiosInstance, {
  AxiosInstanceOtherFunction,
} from "@/utils/axiosInstance";
import { Mutex } from "async-mutex";
import axios from "axios";
const tokenMutex = new Mutex();
const initialState = {
  user: null,
  loading: true,
};
const reducer = (state, action) => {
  if (action.type === "INITIAL") {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGIN") {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === "LOGOUT") {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setSession(accessToken);
        const decoded = jwtDecode(accessToken);
        let corecommerceData;
        const release = await tokenMutex.acquire();
        if (!corecommerceData) {
          const data = await axiosInstance({
            url: `corecommerce/userses/findByName?name=${decoded.sub}`,
            headers: {
              Authorization: "Bearer " + accessToken,
              "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
              "Content-Type": "application/json",
            },
          });
          corecommerceData = data.data.data;
          release();
        } else {
          release();
        }
        dispatch({
          type: "INITIAL",
          payload: {
            user: { ...decoded, ...corecommerceData },
          },
        });
      } else {
        setSession(null);
        dispatch({
          type: "INITIAL",
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: "INITIAL",
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN
  const login = useCallback(async (data) => {
    //checl
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setSession(data.accessToken);
    const res = await axios({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL,
      url: `corecommerce/userses/findByName?name=${data.payload.sub}`,
      headers: {
        Authorization: "Bearer " + data.accessToken,
        "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
        "Content-Type": "application/json",
      },
    });
    AxiosInstanceOtherFunction.setTokens();
    dispatch({
      type: "LOGIN",
      payload: {
        user: { ...data.payload, ...res.data.data },
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    AxiosInstanceOtherFunction.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({
      type: "LOGOUT",
    });
  }, []);

  // ----------------------------------------------------------------------
  const checkAuthenticated = state.user ? "authenticated" : "unauthenticated";

  const status = state.loading ? "loading" : checkAuthenticated;
  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: "jwt",
      loading: status === "loading",
      authenticated: status === "authenticated",
      unauthenticated: status === "unauthenticated",
      //
      login,

      logout,
    }),
    [login, logout, state.user, status]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
