/* eslint-disable no-restricted-globals */

import { useEffect } from "react";
import NProgress from "nprogress";
import dynamic from "next/dynamic";
import { Router } from "next/router";

// import StyledProgressBar from './styles';
// eslint-disable-next-line no-undef
const StyledProgressBar = dynamic(() => import("./styles"), { ssr: false });
export default function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    NProgress.configure({ showSpinner: false });
    Router.events.on("routeChangeStart", () => NProgress.start());
    Router.events.on("routeChangeComplete", () => NProgress.done());
    Router.events.on("routeChangeError", () => NProgress.done());
  });

  return <StyledProgressBar />;
}
