import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Button, Tooltip, Box, Grid, Dialog, IconButton, Fade } from '@mui/material';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import BaseGrid from '../../components/grid/base.grid.tsx';
import FormDialog from '../../components/form/form.dialog.tsx';
import { 
  ArrowLeftCircleIcon, 
  ArrowRightCircleIcon, 
  DocumentTextIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import BaseButton from '../../components/ui/BaseButton.tsx';
import InventoryReportPDF from '../items/InventoryReportPDF.jsx';
import ToolLoanPDF from './ToolLoanPDF.jsx';
import SummaryCard from '../../components/ui/SummaryCard.jsx';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
import { fCurrency } from '../../utils/formatNumber.js';

export default function Herramientas() {
  const { hasPermission, isAdmin } = usePermissions();

  const [openModal, setOpenModal] = useState(false);
  const [openLoanModal, setOpenLoanModal] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Builds the URL to display a tool image from its stored filename
  const getToolImgSrc = (item) => {
    if (!item.img) return null;
    return `${axios.defaults.baseURL}/getTool/image/${item.id}?v=${item.img}`;
  };

  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridData, setGridData] = useState([]);
  const [toolGroups, setToolGroups] = useState([]);

  const company = sessionStorage.getItem('company');

  useEffect(() => {
    axios.get(`/getToolGroup/${company}`).then(res => {
      setToolGroups(res.data.data || res.data || []);
    }).catch(err => console.error("Error fetching tool groups", err));
  }, [company]);

  const inventoryStats = useMemo(() => {
    const totalValue = gridData.reduce((acc, item) => acc + (Number(item.amount) * Number(item.price || 0)), 0);
    return {
      totalValue,
      distinctItems: gridData.length
    };
  }, [gridData]);

  const movementInitialValues = useMemo(() => (selectedItem ? { id: selectedItem.id } : {}), [selectedItem]);

  const openMovement = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setOpenModal(true);
  };

  const fields = [
    {
      name: 'description',
      label: 'Descripción de la herramienta',
      input: 'text',
      grid: { xs: 12, md: 12 },
      rows: 3,
    },
    {
      name: 'amount',
      label: 'Cantidad que ingresa',
      input: 'number',
      grid: { xs: 12, md: 6 },
      dynamicProps: ({ mode }) => ({
        disabled: mode === 'update' && !isAdmin
      })
    },
    {
      name: 'group_item',
      label: 'Grupo al que pertenece',
      input: 'select',
      endpoint: `/getToolGroup/${sessionStorage.getItem('company')}`,
      grid: { xs: 12, md: 6 },
    },
    {
      name: 'position1',
      label: 'Lugar de almacenamiento 1',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'position2',
      label: 'Lugar de almacenamiento 2',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'position3',
      label: 'Lugar de almacenamiento 3',
      input: 'text',
      grid: { xs: 12 },
    },
    { 
      name: 'price', 
      label: 'Precio', 
      input: 'currency', 
      grid: { xs: 12, md: 6 },
    },
    { 
      name: 'unitOfMeasure', 
      label: 'Unidad de medida', 
      input: 'select', 
      endpoint: `/getToolUnitOfMeasure/${sessionStorage.getItem('company')}`,
      optionLabel: 'unitOfMeasure',
      grid: { xs: 12, md: 6 },
    },
    {
      name: 'img',
      label: 'Imagen de la herramienta',
      input: 'file',
      grid: { xs: 12 },
    }
  ];

  const loanFields = useMemo(() => [
    {
      name: 'net_tools',
      input: 'toolTransfer',
      label: '',
      grid: { xs: 12 },
    },
    {
      name: 'borrower_user_id',
      label: 'Usuario al que se presta',
      input: 'select',
      endpoint: `/getUser/${sessionStorage.getItem('company')}`,
      optionLabel: 'name',
      optionValue: 'id',
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'observations',
      label: 'Observaciones',
      input: 'text',
      rows: 3,
      grid: { xs: 12 },
    },
  ], []);

  const movementFields = useMemo(() => [
    {
      name: movementType === 'entrance' ? 'entranceAmount' : 'exitAmount',
      label: 'Cantidad',
      input: 'number',
      grid: { xs: 12 },
    },
  ], [movementType]);

  const mapToolsData = (tools) => {
    return tools.map((item) => {
      const totalAmount = Number(item.amount) || 0;
      const lentAmount = Number(item.lent_amount) || 0;
      const availableAmount = totalAmount - lentAmount;

      return {
        img: item.img,
        id: item.id,
        description: item.description,
        amount: item.amount,
        'Cant. Total': totalAmount,
        'Cant. Prestada': lentAmount,
        'Cant. Disponible': availableAmount,
        Grupo: item.ToolGroup?.name || 'S/N',
        Unidad: item.ToolUnitOfMeasure?.unitOfMeasure || 'S/N',
        price: item.price,
        location: [item.position1, item.position2, item.position3].filter(Boolean).join(' - ') || '-',
        group_item: item.group_item || item.ItemGroup?.id,
        unitOfMeasure: item.unitOfMeasure || item.UnitOfMeasure?.id,
        lent_amount: lentAmount,
      };
    });
  };

  const makeAndDownloadLoanPDF = async (response, payload) => {
    const users = await axios.get(`/getUser/${company}`).then(r => r.data.data || []);
    const borrower = users.find(u => String(u.id) === String(payload.borrower_user_id));
    const loanPDF = {
      loanId: response.data.loanId,
      date: new Date().toLocaleDateString(),
      borrowerName: borrower?.name || 'S/N',
      createdByName: decrypt(sessionStorage.getItem('name')) || 'S/N',
      observations: payload.observations,
      tools: (payload.net_tools || []).map(tool => {
        const gItem = gridData.find(g => g.id === tool.id);
        return {
          id: tool.id,
          description: gItem?.description || `Herramienta #${tool.id}`,
          group: gItem?.Grupo || '-',
          quantity: tool.quantity || 1,
        };
      }),
    };

    const blob = await pdf(<ToolLoanPDF loan={loanPDF} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prestamo_herramientas_${loanPDF.loanId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadInventoryReport = async () => {
    const blob = await pdf(
      <InventoryReportPDF 
        data={gridData} 
        stats={inventoryStats} 
        user={decrypt(sessionStorage.getItem('name'))} 
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_herramientas_${new Date().getTime()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* SUMMARY CARDS */}
      <Grid container spacing={2} mb={4} alignItems="stretch">
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Total de herramientas"
            value={inventoryStats.distinctItems}
            icon={CalendarDaysIcon}
            iconColor="text-blue-600"
            iconBgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Valor Total Herramientas"
            value={fCurrency(inventoryStats.totalValue)}
            icon={CurrencyDollarIcon}
            iconColor="text-amber-500"
            iconBgColor="#fffbeb"
            textColor="#059669"
          />
        </Grid>
      </Grid>

      <BaseGrid
        key={refreshKey}
        title="Herramientas"
        endpoint={`/getTool/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveTool"
        updateEndpoint="/updateTool"
        deleteEndpoint="/deleteTool"
        fetchOneEndpoint="/oneTool"
        fields={fields}
        onDataChange={setGridData}
        mapData={mapToolsData}
        excludeKeys={['img', 'company', 'state', 'created_at', 'updated_at', 'password', 'user', 'group_item', 'unitOfMeasure', 'price', 'amount', 'lent_amount']}
        firstHeader={{ label: 'Foto' }}
        hideCreate={!hasPermission(PERMISOS.CREAR_HERRAMIENTAS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}
        customFilters={[
          {
            key: 'description',
            label: 'Nombre',
            type: 'text'
          },
          {
            key: 'Grupo',
            label: 'Grupo',
            type: 'select',
            options: toolGroups.map(g => ({ value: g.name || g.description, label: g.name || g.description }))
          }
        ]}
        extraHeaders={[
          { label: 'Precio', after: 'Unidad' },
          { label: 'ENTRADA/SALIDA' },
        ]}
        extraHeaderActions={
          <Box display="flex" gap={2}>
            {hasPermission(PERMISOS.CREAR_PRESTAMOS) && (
              <BaseButton
                color="green"
                text="Registrar Préstamo"
                onClick={() => setOpenLoanModal(true)}
              />
            )}
            <Button
              variant="contained"
              onClick={downloadInventoryReport}
              startIcon={<DocumentTextIcon className="h-5 w-5" />}
              sx={{
                bgcolor: '#1e40af',
                '&:hover': { bgcolor: '#1e3a8a' },
                borderRadius: 2,
                px: 3,
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Inventario PDF
            </Button>
          </Box>
        }
        renderExtraCell={({ item, headerLabel }) => {
          if (headerLabel === 'Foto') {
            const src = getToolImgSrc(item);
            return src ? (
              <Tooltip title="Ver imagen" placement="top">
                <Box
                  component="img"
                  src={src}
                  alt={item.description}
                  onClick={() => setLightboxSrc(src)}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    objectFit: 'cover',
                    cursor: 'zoom-in',
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    },
                  }}
                />
              </Tooltip>
            ) : (
              <Box sx={{
                width: 48, height: 48, borderRadius: 1.5,
                bgcolor: 'rgba(59,130,246,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px dashed #cbd5e1'
              }}>
                <PhotoIcon style={{ width: 22, height: 22, color: '#94a3b8' }} />
              </Box>
            );
          }
          if (headerLabel === 'Precio') return item.price != null && item.price !== '' ? fCurrency(item.price) : '-';
          if (headerLabel === 'ENTRADA/SALIDA') return (
            <div className="flex items-center gap-2">
              {hasPermission(PERMISOS.INGRESAR_MATERIAL) && (
                <Tooltip title="Entrada" placement="top">
                  <span>
                    <Button onClick={() => openMovement(item, 'entrance')}>
                      <ArrowRightCircleIcon className="h-6 w-6 text-green-600" />
                    </Button>
                  </span>
                </Tooltip>
              )}
              {isAdmin && (
                <Tooltip title="Salida" placement="top">
                  <span>
                    <Button onClick={() => openMovement(item, 'exit')}>
                      <ArrowLeftCircleIcon className="h-6 w-6 text-red-600" />
                    </Button>
                  </span>
                </Tooltip>
              )}
            </div>
          );
        }}
      />

      <FormDialog
        title="Registrar Préstamo de Herramientas"
        open={openLoanModal}
        fields={loanFields}
        saveEndpoint='saveToolLoan'
        maxWidth="md"
        onClose={() => setOpenLoanModal(false)}
        onSuccess={({ response, payload }) => {
          makeAndDownloadLoanPDF(response, payload);
          setRefreshKey(prev => prev + 1);
        }}
      />

      <FormDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
        fields={movementFields}
        mode="update"
        initialValues={movementInitialValues}
        title={`${movementType === 'entrance' ? 'Entrada' : 'Salida'} de herramientas`}
        saveEndpoint={movementType === 'entrance' ? `/entranceTool` : `/exitTool`}
      />
      {/* ── Lightbox ─────────────────────────────────── */}
      <Dialog
        open={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        maxWidth={false}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            m: 2,
          },
        }}
        sx={{ '& .MuiBackdrop-root': { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.75)' } }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          {/* Close button */}
          <IconButton
            onClick={() => setLightboxSrc(null)}
            sx={{
              position: 'absolute',
              top: -18,
              right: -18,
              bgcolor: 'white',
              color: '#1e293b',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              '&:hover': { bgcolor: '#f1f5f9' },
              zIndex: 10,
            }}
          >
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </IconButton>

          <Box
            component="img"
            src={lightboxSrc}
            alt="Herramienta"
            sx={{
              display: 'block',
              maxWidth: '85vw',
              maxHeight: '80vh',
              borderRadius: 3,
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Dialog>
    </>
  );
}
