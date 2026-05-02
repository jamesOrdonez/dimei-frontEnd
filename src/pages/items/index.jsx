import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Button, Tooltip, Box, Menu, MenuItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import BaseGrid from '../../components/grid/base.grid.tsx';
import FormDialog from '../../components/form/form.dialog.tsx';
import { 
  ArrowLeftCircleIcon, 
  ArrowRightCircleIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import BaseButton from '../../components/ui/BaseButton.tsx';
import RemisionPDF from '../productos/remisionPDF.jsx';
import InventoryReportPDF from './InventoryReportPDF.jsx';
import SummaryCard from '../../components/ui/SummaryCard.jsx';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';
import { QRCodeCanvas } from 'qrcode.react';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
import { fCurrency } from '../../utils/formatNumber.js';

export default function Items() {
  const { hasPermission, isAdmin } = usePermissions();

  const [openModal, setOpenModal] = useState(false);
  const [openModalRemission, setOpenModalRemission] = useState(false);
  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridData, setGridData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [qrMenuAnchor, setQrMenuAnchor] = useState(null);
  const [selectedQRItem, setSelectedQRItem] = useState(null);
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
  const handleQRClick = (event, item) => {
    setQrMenuAnchor(event.currentTarget);
    setSelectedQRItem(item);
  };

  const handleQRMenuClose = () => {
    setQrMenuAnchor(null);
    setSelectedQRItem(null);
  };

  const company = sessionStorage.getItem('company');

  useEffect(() => {
    axios.get(`/getProjects/${company}`).then(res => {
      setProjects(res.data.data || []);
    }).catch(err => console.error("Error fetching projects", err));
  }, [company]);

  const handleDownloadQR = () => {
    if (!selectedQRItem) return;
    
    const canvas = document.getElementById('qr-canvas-download');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${selectedQRItem.description || selectedQRItem.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    handleQRMenuClose();
  };
   const fields = [
    {
      name: 'description',
      label: 'Descripción del item',
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
      endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
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
      endpoint: '/unitOfMeasuremet', 
      optionLabel: 'unitOfMeasure',
      grid: { xs: 12, md: 6 },
    },
    { 
      name: 'low_stock', 
      label: 'Umbral de stock bajo', 
      input: 'number', 
      grid: { xs: 12, md: 12 },
    },
    {
      name: 'proveedor_id',
      label: 'Proveedor asociado',
      input: 'select',
      endpoint: `/getClientes/${sessionStorage.getItem('company')}?tipo=proveedor`,
      optionLabel: 'nombre',
      optionValue: 'id',
      grid: { xs: 12, md: 12 },
    },
    {
      name: 'img',
      label: 'Imagen del item',
      input: 'file',
      grid: { xs: 12 },
    }
  ];

  const remissionFields = useMemo(() => [
    {
      name: 'fk_proyect',
      label: 'Seleccione Proyecto',
      input: 'select',
      endpoint: `/getProjects/${sessionStorage.getItem('company')}`,
      optionLabel: 'customer',
      optionValue: 'id',
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción de la remisión',
      input: 'text',
      rows: 4,
      grid: { xs: 12 },
    },
    {
      name: 'net_items',
      input: 'itemTransfer',
      grid: { xs: 12 },
    }
  ], []);

  const movementFields = useMemo(() => [
    {
      name: movementType === 'entrance' ? 'entranceAmount' : 'exitAmount',
      label: 'Cantidad',
      input: 'number',
      grid: { xs: 12 },
    },
  ], [movementType]);

  const mapItemsData = (items) => {
    return items.map(item => ({
      img: item.img, // Ensure img is at the start
      id: item.id,
      description: item.description,
      amount: item.amount,
      Grupo: item.ItemGroup?.name || 'S/N',
      Unidad: item.UnitOfMeasure?.unitOfMeasure || 'S/N',
      Proveedor: item.Proveedor?.nombre || '-',
      price: item.price,
      location: [item.position1, item.position2, item.position3].filter(Boolean).join(' - ') || '-',
      group_item: item.group_item || item.ItemGroup?.id, // Keep for filtering in remission modal
      unitOfMeasure: item.unitOfMeasure || item.UnitOfMeasure?.id, // Keep for reference
      proveedor_id: item.proveedor_id || item.Proveedor?.id,
    }));
  };

  const makeAndDownloadPDF = async (response, payload) => {
    const project = projects.find(p => String(p.id) === String(payload.fk_proyect));
    const remisionPDF = {
      remisionId: response.data.remisionId,
      projectId: payload.fk_proyect,
      cliente: project?.customer || 'S/N',
      fecha: new Date().toLocaleDateString(),
      description: payload.description,
      items: (payload.net_items || []).map(item => {
        const gItem = gridData.find(gItem => gItem.id === item.id);
        return {
          id: gItem.id,
          description: gItem.description,
          grupo: gItem.group,
          cantidad: item.quantity
        }
      }),
      elaboradoPor: decrypt(sessionStorage.getItem('name')) || 'S/N',
      aprobadoPor: ' ',
    };

    const blob = await pdf(<RemisionPDF remision={remisionPDF} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remision_${remisionPDF.remisionId}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

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
    link.download = `reporte_inventario_${new Date().getTime()}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* SUMMARY CARDS */}
      <Grid container spacing={2} mb={4} alignItems="stretch">
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Total de items"
            value={inventoryStats.distinctItems}
            icon={CalendarDaysIcon}
            iconColor="text-blue-600"
            iconBgColor="#eff6ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Valor Total Inventario"
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
        title="Items"
        endpoint={`/getItem/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveItem"
        updateEndpoint="/updateItem"
        deleteEndpoint="/deleteItem"
        fetchOneEndpoint="/oneItem"
        firstHeader="QR"
        fields={fields}
        onDataChange={setGridData}
        mapData={mapItemsData}
        excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password', 'user', 'group_item', 'unitOfMeasure', 'price', 'proveedor_id']}
        hideCreate={!hasPermission(PERMISOS.CREAR_ITEMS)}
        hideEdit={!hasPermission(PERMISOS.CREAR_ITEMS)}
        hideDelete={!isAdmin}
        extraHeaders={[
          { label: 'Precio', after: 'Unidad' },
          { label: 'ENTRADA/SALIDA' },
        ]}
        extraHeaderActions={
          <Box display="flex" gap={2}>
            {hasPermission(PERMISOS.HACER_REMISIONES) && (
              <BaseButton
                color="green"
                text="Remisionar"
                onClick={() => setOpenModalRemission(true)}
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
          if (headerLabel === 'Precio') return item.price != null && item.price !== '' ? fCurrency(item.price) : '-';
          if (headerLabel === 'QR') return (
            <Tooltip title="Opciones de QR" placement="top">
              <Box 
                onClick={(e) => handleQRClick(e, item)}
                sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
              >
                <QRCodeCanvas 
                  id={`qr-canvas-${item.id}`}
                  value={`${window.location.origin}/public/item/${item.id}`} 
                  size={48}
                  level="H"
                  includeMargin={true}
                />
              </Box>
            </Tooltip>
          );
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
        title="Nueva remisión"
        open={openModalRemission}
        fields={remissionFields}
        saveEndpoint='saveRemision'
        maxWidth="md"
        onClose={() => setOpenModalRemission(false)}
        onSuccess={({ response, payload }) => {
          makeAndDownloadPDF(response, payload);
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
        title={`${movementType === 'entrance' ? 'Entrada' : 'Salida'} de inventario`}
        saveEndpoint={movementType === 'entrance' ? `/entrance` : `/exit`}
      />

      <Menu
        anchorEl={qrMenuAnchor}
        open={Boolean(qrMenuAnchor)}
        onClose={handleQRMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={() => {
          window.open(`${window.location.origin}/public/item/${selectedQRItem?.id}`, '_blank');
          handleQRMenuClose();
        }}>
          <ListItemIcon>
            <EyeIcon className="h-5 w-5 text-blue-500" />
          </ListItemIcon>
          <ListItemText primary="Ver vista pública" />
        </MenuItem>
        
        <MenuItem onClick={handleDownloadQR}>
          <ListItemIcon>
            <ArrowDownTrayIcon className="h-5 w-5 text-green-500" />
          </ListItemIcon>
          <ListItemText primary="Descargar QR" />
        </MenuItem>
      </Menu>

      {/* Hidden high-res QR for download */}
      <Box sx={{ display: 'none' }}>
        <QRCodeCanvas 
          id="qr-canvas-download"
          value={selectedQRItem ? `${window.location.origin}/public/item/${selectedQRItem?.id}` : ''} 
          size={1024}
          level="H"
          includeMargin={true}
        />
      </Box>
    </>
    );
}
