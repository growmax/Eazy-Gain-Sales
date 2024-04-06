import { Box, Typography } from "@mui/material";

const QuatityDetails = ({
  unitQuantity,
  // unitOfMeasure,
  packagingQty,
  minOrderQuantity,
  secondaryUOM
}) => (
  <Box display="flex" flexWrap="wrap" mb={1}>
    <Typography variant="caption" noWrap>
      {unitQuantity ? unitQuantity : 1} {secondaryUOM ? secondaryUOM : ""}
    </Typography>
    {Boolean(packagingQty) && (
      <Typography
        variant="caption"
        noWrap
        style={{ marginLeft: 5, marginRight: 5 }}
      >
        ·
      </Typography>
    )}
    {Boolean(packagingQty) && (
      <Typography variant="caption" title={`Pack of ${packagingQty}`} noWrap>
        Pack of {packagingQty}
      </Typography>
    )}
    {Boolean(minOrderQuantity) && (
      <Typography
        variant="caption"
        noWrap
        style={{ marginLeft: 5, marginRight: 5 }}
      >
        ·
      </Typography>
    )}
    {Boolean(minOrderQuantity) && (
      <Typography variant="caption" title={`MOQ ${minOrderQuantity}`} noWrap>
        MOQ {minOrderQuantity}
      </Typography>
    )}
  </Box>
);

export default QuatityDetails;
