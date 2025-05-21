// Métodos para el manejo de errores en login o registro

export function crearContenedorError() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'mensaje-error';
    errorDiv.className = 'mensaje-error';
    formularioRegistro.prepend(errorDiv);
    return errorDiv;
}

export function mostrarError(elementoInput, mensaje) {
    // Agregar clase de error al input
    elementoInput.classList.add('error');
    
    // Crear o actualizar elemento de mensaje de error
    let elementoError = elementoInput.nextElementSibling;
    if (!elementoError || !elementoError.classList.contains('campo-error')) {
        elementoError = document.createElement('p');
        elementoError.className = 'campo-error';
        elementoInput.parentNode.insertBefore(elementoError, elementoInput.nextSibling);
    }
    elementoError.textContent = mensaje;
}

export function mostrarErrorEnFormulario(mensaje) {
    const contenedorError = document.getElementById('mensaje-error') || crearContenedorError();
    contenedorError.textContent = mensaje;
    contenedorError.style.display = 'block';
}

export function limpiarErrores() {
    // Limpiar errores de campos
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    // Eliminar mensajes de error de campos
    document.querySelectorAll('.campo-error').forEach(el => {
        el.remove();
    });
    
    // Limpiar mensaje de error general
    const contenedorError = document.getElementById('mensaje-error');
    if (contenedorError) {
        contenedorError.textContent = '';
        contenedorError.style.display = 'none';
    }
}
