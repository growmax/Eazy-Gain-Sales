import axios from "axios";
import { isValidToken } from "./utils";
import { Mutex } from "async-mutex";
const tokenMutex = new Mutex();

class AxiosInstance {
  constructor() {
    this.tokens = null;
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      let refreshToken = localStorage.getItem("refreshToken");
      this.tokens = {
        accessToken,
        refreshToken,
      };
    }
  }
  createAxiosInstance() {
    const headers = {
      "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
    };
    const axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL,
      headers,
    });
    axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          if (
            typeof window !== "undefined" &&
            !isValidToken(this.tokens?.accessToken)
          ) {
            config.headers.Authorization = `Bearer ${this.tokens?.accessToken}`;
            const release = await tokenMutex.acquire();
            const refreshedToken = await refreshAccessToken();
            if (refreshedToken) {
              const { accessToken, refreshToken } = refreshedToken.tokens;
              this.tokens = {
                accessToken,
                refreshToken,
              };

              localStorage.setItem("accessToken", accessToken);
              localStorage.setItem("refreshToken", refreshToken);

              config.headers.Authorization = `Bearer ${accessToken}`;
            } else {
              config.headers.Authorization = `Bearer ${this.tokens?.accessToken}`;
            }

            release();
          } else {
            config.headers.Authorization = `Bearer ${this.tokens?.accessToken}`;
          }
          return config;
        } catch (error) {
          return config;
        }
      },
      (error) => {
        console.log(error);
        // eslint-disable-next-line no-undef
        return Promise.reject(error);
      }
    );
    return axiosInstance;
  }
  logout() {
    this.tokens = null;
  }
  setTokens() {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      let refreshToken = localStorage.getItem("refreshToken");
      this.tokens = {
        accessToken,
        refreshToken,
      };
    }
  }
}
const axiosInstance = new AxiosInstance().createAxiosInstance();

export default axiosInstance;

// export default axiosInstance
// function getaxiosInstance() {
//   const headers = {
//     "x-tenant": process.env.NEXT_PUBLIC_TENANT_ID,
//   };
//   if (typeof window !== "undefined") {
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       headers.Authorization = "Bearer " + accessToken;
//     }
//   }
//   const axiosInstance = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_BASE_URL,
//     headers,
//   });
//   if (typeof window !== "undefined") {
//     let LocalaccessToken = localStorage.getItem("accessToken");
//     if (LocalaccessToken) {
//       axiosInstance.interceptors.request.use(
//         async (config) => {
//           try {
//             if (LocalaccessToken) {
//               if (!isValidToken(LocalaccessToken)) {
//                 const release = await tokenMutex.acquire();
//                 const refreshedToken = await refreshAccessToken();

//                 const { accessToken, refreshToken } = refreshedToken.tokens;
//                 localStorage.setItem("accessToken", accessToken);
//                 localStorage.setItem("refreshToken", refreshToken);
//                 config.headers.Authorization = `Bearer ${accessToken}`;
//                 release();
//               } else {
//                 config.headers.Authorization = `Bearer ${LocalaccessToken}`;
//               }
//               return config;
//             }
//             return config;
//           } catch (error) {
//             return config;
//           }
//         },
//         (error) => {
//           console.log(error);
//           // eslint-disable-next-line no-undef
//           return Promise.reject(error);
//         }
//       );
//     }
//   }

//   return axiosInstance;
// }
// export default getaxiosInstance();

async function refreshAccessToken() {
  try {
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) {
      let res = await axios({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}auth/auth/refreshToken`,
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
          origin,
        },
        method: "POST",
        data: JSON.stringify({
          refreshToken,
          accessToken,
        }),
      });
      return res.data;
    } else {
      return null;
    }
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log(error);
  }
}

export const AxiosInstanceOtherFunction = new AxiosInstance();
