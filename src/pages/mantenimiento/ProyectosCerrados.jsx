import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { DocumentArrowDownIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import DeliveryActPdf from '../proyectos/components/DeliveryActPdf.jsx';
import { decrypt } from '../../utils/crypto.js';

export default function ProyectosCerrados() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [uploading, setUploading] = useState(null);
  const company = sessionStorage.getItem('company');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/getProjects/${company}?tipo=proyecto`);
      const allProjects = response.data.data || [];
      const closedProjects = allProjects.filter(p => p.state === 'Finalizado');
      setProjects(closedProjects);
    } catch (error) {
      console.error('Error fetching closed projects:', error);
      Swal.fire('Error', 'No se pudieron cargar los proyectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [company]);

  const handleDownloadActa = async (project) => {
    try {
      setDownloading(project.id);
      const res = await axios.get(`/getOneProject/${project.id}`);
      const fullProjectData = res.data.data?.[0] || res.data?.[0] || res.data;
      
      const user = decrypt(sessionStorage.getItem('name'));
      
      const blob = await pdf(<DeliveryActPdf project={fullProjectData} user={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `acta_entrega_proyecto_${project.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo generar el acta', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleFileUpload = async (event, project) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire('Formato Inválido', 'El acta debe ser un archivo PDF.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('signed_act', file);

    setUploading(project.id);
    try {
      await axios.post(`/uploadSignedAct/${project.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire('Éxito', 'El acta firmada se ha cargado correctamente.', 'success');
      fetchProjects(); // refresh list to show updated status
    } catch (error) {
      console.error('Error uploading signed act:', error);
      Swal.fire('Error', 'Hubo un problema al subir el archivo.', 'error');
    } finally {
      setUploading(null);
      event.target.value = null; // reset input
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Proyectos Cerrados
      </Typography>

      <Card>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell><b>ID Proyecto</b></TableCell>
                  <TableCell><b>Cliente</b></TableCell>
                  <TableCell><b>Sistema Motriz</b></TableCell>
                  <TableCell><b>Estado Acta</b></TableCell>
                  <TableCell><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay proyectos cerrados disponibles.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>#{project.id}</TableCell>
                      <TableCell>{project.customerName || 'S/N'}</TableCell>
                      <TableCell>{project.elevatorTypeName || 'S/N'}</TableCell>
                      <TableCell>
                        {project.signed_act ? (
                          <Chip 
                            icon={<CheckCircleIcon className="w-4 h-4 text-green-700" />} 
                            label="Acta Firmada Subida" 
                            color="success" 
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Chip 
                            label="Acta Pendiente" 
                            color="warning" 
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleDownloadActa(project)}
                            disabled={downloading === project.id}
                            startIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                          >
                            {downloading === project.id ? 'Generando...' : 'Descargar Acta'}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            disabled={uploading === project.id}
                            component="label"
                            startIcon={<DocumentArrowUpIcon className="w-4 h-4" />}
                            sx={{ textTransform: 'none', borderRadius: 1.5 }}
                          >
                            {uploading === project.id ? 'Subiendo...' : (project.signed_act ? 'Reemplazar Acta' : 'Subir Firmada')}
                            <input
                              type="file"
                              hidden
                              accept="application/pdf"
                              onChange={(e) => handleFileUpload(e, project)}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
