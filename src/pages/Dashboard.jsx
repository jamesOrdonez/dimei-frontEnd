import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from 'axios';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, CircularProgress, Box } from '@mui/material';
// components
import { AppCurrentVisits, AppWebsiteVisits, AppWidgetSummary, AppConversionRates } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projectsByStatus: [],
    totalProjects: 0,
    totalItems: 0,
    totalRemissions: 0,
    lowStockItems: 0,
    remissionsByMonth: [],
    topItems: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const companyId = sessionStorage.getItem('company') || 1;
      const response = await axios.get(`/dashboard/stats/${companyId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title> Dashboard | DIMEI</title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Panel de Control
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Proyectos" 
              total={stats.totalProjects} 
              icon={'ant-design:project-filled'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Ítems en Inventario" 
              total={stats.totalItems} 
              color="info" 
              icon={'ant-design:database-filled'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Remisiones Realizadas" 
              total={stats.totalRemissions} 
              color="warning" 
              icon={'ant-design:file-text-filled'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Alertas de Stock Bajo" 
              total={stats.lowStockItems} 
              color="error" 
              icon={'ant-design:warning-filled'} 
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Histórico de Remisiones"
              subheader="Actividad mensual de los últimos 6 meses"
              chartLabels={stats.remissionsByMonth.map(item => item.month)}
              chartData={[
                {
                  name: 'Remisiones',
                  type: 'area',
                  fill: 'gradient',
                  data: stats.remissionsByMonth.map(item => item.count),
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Estado de Proyectos"
              chartData={stats.projectsByStatus.map(item => ({
                label: item.state,
                value: item.count
              }))}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Top 10 Ítems con más Stock"
              subheader="Ítems con mayor disponibilidad en inventario"
              chartData={stats.topItems.map(item => ({
                label: item.description,
                value: item.amount
              }))}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
