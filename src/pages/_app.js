import { AuthConsumer } from "@/auth/context/auth-consumer";
import AuthGuard from "@/auth/guards/auth-guard";
import { AuthProvider } from "@/auth/provider/auth-provider";
import MotionLazy from "@/components/animate/motion-lazy";
// import Layout from "@/layout/layout";
// import ThemeProvider from "@/theme/ThemeProvider";
import createEmotionCache from "@/utils/createEmotionCache";
import { CacheProvider } from "@emotion/react";
import dynamic from "next/dynamic";
import Head from "next/head";
// const ThemeProvider =dynamic(() => import("../utils/axiosInstance"), { ssr: false });
const ThemeProvider = dynamic(() => import("@/theme/ThemeProvider"), {
  ssr: false,
});
const Layout = dynamic(() => import("@/layout/layout"), { ssr: false });
const clientSideEmotionCache = createEmotionCache();

export default function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Eazy Gain</title>
        <meta
          name="description"
          content="A direct-to-retailer platform for Indian retailers to buy 100% authentic products directly from brands."
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <ThemeProvider>
        <MotionLazy>
          <AuthProvider>
            <AuthConsumer>
              <AuthGuard>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </AuthGuard>
            </AuthConsumer>
          </AuthProvider>
        </MotionLazy>
      </ThemeProvider>
    </CacheProvider>
  );
}
