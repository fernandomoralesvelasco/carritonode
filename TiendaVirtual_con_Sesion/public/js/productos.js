import { crearTarjetaProducto, mostrarError } from './utilsProductos.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos en la página de productos
    cargarProductos();

    // Función para la carga de productos
    async function cargarProductos() {
        try {
            showLoading();

            let url = '/api/productos';

            const response = await fetch(url);
            const productos = await response.json();
            
            desplegarProductos(productos);    
        } catch (err) {
            console.error('Error al cargar productos:', err);
            mostrarError('Error al cargar los productos. Intenta nuevamente');
        } finally {
            hideLoading();
        }
    }

    // Mostrar productos en el DOM
    function desplegarProductos(productos) {
        const contenedorProductos = document.getElementById('lista-productos');

        if(!contenedorProductos) return;

        contenedorProductos.innerHTML = '';

        if(productos.length === 0) {
            contenedorProductos.innerHTML = `
                <div class="no-productos">
                    <p>No se encontraron productos</p>
                </div>
            `
            return;
        }

        productos.forEach(producto => {
            const tarjetaProducto = crearTarjetaProducto(producto);
            contenedorProductos.appendChild(tarjetaProducto);
        });
    }

    // Mostrar indicador de carga
    function showLoading() {
        const productContainer = document.getElementById('product-list');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="contenedor-carga">
                    <div class="cargando-spinner"></div>
                    <p>Cargando productos...</p>
                </div>
            `;
        }
    }

    // Ocultar indicador de carga
    function hideLoading() {
        // El contenido será reemplazado por los productos
    }
});