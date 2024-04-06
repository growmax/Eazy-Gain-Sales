import * as React from "react";
import PropTypes from "prop-types";
import Document, { Html, Head, Main, NextScript } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "@/utils/createEmotionCache";
import { primaryFont } from "@/theme/typography";
import { useTheme } from "@mui/material/styles";

export default function MyDocument(props) {
  const { emotionStyleTags } = props;
  const theme = useTheme();
  return (
    <Html lang="en" className={primaryFont.className}>
      <Head>
        {/* PWA primary color */}
        <meta name="application-name" content="EazyGain" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EazyGain" />
        <meta
          name="description"
          content="A direct-to-retailer platform for Indian retailers to buy 100% authentic products directly from brands."
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta
          property="twitter:image"
          content="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />
        <meta
          property="twitter:card"
          content="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />
        <meta property="twitter:title" content="Eazy Gain" />
        <meta
          property="twitter:description"
          content="A direct-to-retailer platform for Indian retailers to buy 100% authentic products directly from brands."
        />
        <meta
          property="og:image"
          content="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />
        <meta property="og:title" content="Eazy Gain" />
        <meta
          property="og:description"
          content="A direct-to-retailer platform for Indian retailers to buy 100% authentic products directly from brands."
        />
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="https://growmax-prod-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/app/alfome/icon/PWA_lg7yqqkm14/android-chrome-512x512.png"
        />

        <link rel="manifest" href="/manifest.json" />

        <meta name="emotion-insertion-point" content="" />
        {emotionStyleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};

MyDocument.propTypes = {
  emotionStyleTags: PropTypes.array.isRequired,
};
