import { useAuthContext } from "@/auth/hooks/use-auth-context";
import axiosInstance from "@/utils/axiosInstance";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function TargetCard() {
  const [Amount, setAmount] = useState({});
  const { user } = useAuthContext();
  const { userId, roundOff } = user || {};

  useEffect(() => {
    let LocalaccessToken = localStorage.getItem("accessToken");
    async function fetch() {
      try {
        const corecommerceData = await axiosInstance({
          url: `corecommerce/dashBoardService/accountOwnerAnalytics?userId=${userId}`,
          method: "POST",
        });
        const authData = await axiosInstance({
          url: `auth/target/GetTargetByDay`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${LocalaccessToken}`,
          },
        });
        const getToday = new Date().getUTCDay();
        const currentMonth = new Date().getMonth();
        setAmount({
          ...corecommerceData.data.data,
          TodayTotalValue:
            authData.data?.data?.TargetByDay?.[
              getToday === 0 ? 0 : getToday - 1
            ] || 0,
          MonthlyTotalValue:
            authData.data.data?.TargetByMonth?.[
              currentMonth === 0 ? 0 : currentMonth
            ] || 0,
        });
      } catch (error) {
        console.log(error);
      }
    }
    if (userId) {
      fetch();
    }
  }, [userId]);
  return (
    <>
      {Boolean(Amount?.TodayTotalValue) && (
        <Card
          sx={{
            p: 1,
            mb: 1,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            divider={
              <Divider
                orientation={"horizontal"}
                flexItem
                sx={{ borderStyle: "dashed" }}
              />
            }
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={3}
              sx={{ width: 1, py: 2 }}
            >
              <div>
                <Typography display="flex" variant="h4" sx={{ mb: 0.5 }}>
                  <Box color="success.main">
                    {Amount.dailyTotal?.toFixed(roundOff)}
                  </Box>
                  &nbsp;/&nbsp;
                  {Amount?.TodayTotalValue?.Value?.toFixed(roundOff) || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                  Today Order Value
                </Typography>
              </div>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={3}
              sx={{ width: 1, py: 2 }}
            >
              <div>
                <Typography display="flex" variant="h4" sx={{ mb: 0.5 }}>
                  <Box color="success.main">
                    {Amount.monthlyTotal?.toFixed(roundOff)}
                  </Box>
                  &nbsp;/&nbsp;
                  {Amount?.MonthlyTotalValue?.Value?.toFixed(roundOff) || 0}
                </Typography>

                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                  Monthly Order Value
                </Typography>
              </div>
            </Stack>
          </Stack>
        </Card>
      )}
    </>
  );
}
