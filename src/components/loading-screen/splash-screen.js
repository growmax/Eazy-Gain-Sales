import PropTypes from "prop-types";
import { m } from "framer-motion";
import Box from "@mui/material/Box";
import Logo from "../Logo/logo";

export default function SplashScreen({ sx, ...other }) {
  return (
    <Box
      sx={{
        right: 0,
        width: 1,
        bottom: 0,
        height: 1,
        zIndex: 9998,
        display: "flex",
        position: "fixed",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        ...sx,
      }}
      {...other}
    >
      <>
        <m.div
          animate={{
            scale: [1, 0.9, 0.9, 1, 1],
            opacity: [1, 0.48, 0.48, 1, 1],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeatDelay: 1,
            repeat: Infinity,
          }}
        >
          <Logo
            disabledLink
            sx={{
              width: 340,
              height: 340,
            }}
          />
        </m.div>
      </>
    </Box>
  );
}

SplashScreen.propTypes = {
  sx: PropTypes.object,
};
