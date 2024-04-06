import PropTypes from "prop-types";
// @mui
import { Box } from "@mui/material";
import Link from "next/link";

const Logo = ({ disabledLink = false, sx, light }) => {
  const logo = (
    <Box
      component="img"
      src={
        light
          ? "/logo/dark_eazy_gain_logo.svg"
          : "/logo/light_eazy_gain_logo.svg"
      }
      sx={{ width: 40, height: 40, cursor: "pointer", ...sx }}
    />
  );

  if (disabledLink) {
    return logo;
  }

  return (
    <Link href="/" sx={{ display: "contents" }}>
      {logo}
    </Link>
  );
};

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;
