import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PermissionsContext = createContext({
    permissions: [],
    rolName: null,
    isAdmin: false,
    loading: true,
    hasPermission: () => false,
    refreshPermissions: () => {},
});

export const PERMISOS = {
    INGRESAR_MATERIAL: 'Acceso a ingresar material',
    HACER_REMISIONES: 'Hacer remisiones de proyectos',
    CREAR_ITEMS: 'Crear ítems',
    CREAR_PRODUCTOS: 'Crear productos',
    CREAR_PROYECTOS: 'Crear proyectos',
    CONSULTAR_LISTAS: 'Consultar listas de compras',
    ANEXAR_ACTAS: 'Anexar actas de entrega',
    PEDIR_MATERIAL: 'Pedir material adicional',
    VER_PROYECTOS: 'Visualizar proyectos',
    VER_HERRAMIENTAS: 'Ver herramientas y préstamos',
    CREAR_HERRAMIENTAS: 'Crear herramientas',
    CREAR_PRESTAMOS: 'Crear préstamos de herramientas',
    DEVOLVER_HERRAMIENTAS: 'Devolver herramientas',
};

export function PermissionsProvider({ children }) {
    const [permissions, setPermissions] = useState([]);
    const [rolName, setRolName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadPermissions = useCallback(async () => {
        const token = sessionStorage.getItem('Token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('/getMyPermissions');
            const data = res.data;
            setPermissions(data.permissions || []);
            setRolName(data.rolName || null);
            setIsAdmin(data.isAdmin || false);

            // Cache en sessionStorage para acceso síncrono si se necesita
            sessionStorage.setItem('permissions', JSON.stringify(data.permissions || []));
            sessionStorage.setItem('isAdmin', data.isAdmin ? '1' : '0');
        } catch (err) {
            console.error('Error cargando permisos:', err);
            // Fallback a cache local
            try {
                const cached = JSON.parse(sessionStorage.getItem('permissions') || '[]');
                setPermissions(cached);
                setIsAdmin(sessionStorage.getItem('isAdmin') === '1');
            } catch { /* ignore */ }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const hasPermission = useCallback((permiso) => {
        if (isAdmin) return true;
        return permissions.includes(permiso);
    }, [permissions, isAdmin]);

    return (
        <PermissionsContext.Provider value={{
            permissions,
            rolName,
            isAdmin,
            loading,
            hasPermission,
            refreshPermissions: loadPermissions,
        }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    return useContext(PermissionsContext);
}

export default PermissionsContext;
