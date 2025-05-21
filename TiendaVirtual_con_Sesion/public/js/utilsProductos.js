// utilsProductos.js

// Crear tarjeta de producto
export function crearTarjetaProducto(producto) {
    const tarjetaProducto = document.createElement('div');
    tarjetaProducto.className = 'tarjeta-producto fade-in';
    
    tarjetaProducto.innerHTML = `
        <div class="contenedor-imagen-producto">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
            ${producto.stock <= 0 ? '<span class="no-stock">Agotado</span>': ''}
        </div>
        <div class="info-producto">
            <h3>${producto.nombre}</h3>
            <p class="precio-producto">$${producto.precio.toFixed(2)}</p>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="meta-producto">
                <span class="categoria-producto">${producto.categoria}</span>
                <span class="stock-producto">${producto.stock} disponibles</span>
            </div>
            <div class="acciones-producto">
                <button class="btn add-to-cart" data-id="${producto.id}"
                    ${producto.stock <= 0 ? 'disabled': ''}>
                    ${producto.stock <= 0 ? 'Agotado': 'Agregar al carrito'}
                </button>
            </div>
        </div>                                                                                                    
    `;
    
    return tarjetaProducto;
}

export function mostrarError(mensaje) {
    const contenedorProducto = document.getElementById('lista-productos');
    if (contenedorProducto) {
        contenedorProducto.innerHTML = `
            <div class="mensaje-error">
                <p>${mensaje}</p>
                <button class="btn" onclick="window.location.reload()">Recargar</button>
            </div>
        `;
    }
}
