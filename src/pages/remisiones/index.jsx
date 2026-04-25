import { Button, Tooltip } from '@mui/material';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import RemisionPDF from '../productos/remisionPDF.jsx';
import { pdf } from '@react-pdf/renderer';

export default function Remisiones() {

  const fields = [
    {
      name: 'id',
      label: 'ID Remisión',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'date',
      label: 'Fecha',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'fk_proyect',
      label: 'Proyecto',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'customer',
      label: 'Cliente',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'description',
      label: 'Descripción',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'elaboradoPor',
      label: 'Elaborado Por',
      input: 'text',
      grid: { xs: 12 },
    }
  ];

  const mapRemisionesData = (items) => {
    return items.map(item => ({
      ...item,
      id: item.id,
      date: new Date(item.date).toLocaleDateString(),
      customer: item.customer,
      description: item.description,
      elaboradoPor: item.elaboradoPor,
    }));
  };

  const makeAndDownloadPDF = async (remision) => {
    // Transform backend data to match RemisionPDF expected structure
    const remisionPDF = {
      remisionId: remision.id,
      projectId: remision.fk_proyect,
      cliente: remision.customer,
      fecha: remision.date,
      description: remision.description,
      elaboradoPor: remision.elaboradoPor,
      aprobadoPor: ' ',
      products: (remision.remisionProducts || []).map(rp => ({
        id: rp.product?.id || rp.fk_product,
        name: rp.product?.name || `Producto ${rp.fk_product}`,
        cantidad: rp.quantity,
        components: [] // The detailed components are not fetched by default for historical PDF, unless we want to include them in the backend. If needed, the backend can be expanded to return them.
      })),
      items: (remision.remisionItems || []).map(ri => ({
        id: ri.item?.id || ri.fk_item,
        description: ri.item?.description || `Ítem ${ri.fk_item}`,
        cantidad: ri.quantity
      }))
    };

    try {
      const blob = await pdf(<RemisionPDF remision={remisionPDF} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `remision_${remision.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  return (
    <>
      <BaseGrid
        title="Remisiones Realizadas"
        endpoint={`/getAll/${sessionStorage.getItem('company')}`}
        fields={fields}
        mapData={mapRemisionesData}
        hideCreate={true}
        hideEdit={true}
        hideDelete={true}
        excludeKeys={['company', 'fkUser', 'proyect', 'user', 'remisionProducts', 'remisionItems']}
        renderExtraActions={(item) => (
          <Tooltip title="Descargar PDF" placement="top">
            <span>
              <Button 
                variant="outlined" 
                size="small" 
                color="primary" 
                onClick={() => makeAndDownloadPDF(item)}
                sx={{ minWidth: '40px', p: 1 }}
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </Button>
            </span>
          </Tooltip>
        )}
      />
    </>
  );
}
