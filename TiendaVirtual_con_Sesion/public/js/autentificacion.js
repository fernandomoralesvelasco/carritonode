import { crearContenedorError, mostrarError, mostrarErrorEnFormulario, limpiarErrores } from './utilsAutentificacion.js';

// Scripts para el registro y logueo de usuarios
// Manejo de sesiones en Node.js
// Función mejorada para verificar sesión

document.addEventListener('DOMContentLoaded', () => {
    // Botones para sesión
    const linkLogin = document.getElementById('link-login');
    const linkRegistrar = document.getElementById('link-registrar');
    const btnLogout = document.getElementById('link-logout');
    const linkAdmin = document.getElementById('link-admin');
    const saludoUsuario = document.getElementById('saludo-usuario');

    verificarSesion().then(autenticado => {
        if (autenticado) {
            configurarHistorial();
        }
    });
    
    // Verificación periódica
    setInterval(verificarSesion, 30000);

    if(btnLogout) {
        // Hacer el enlace clickeable
        const link = btnLogout.querySelector('a');
        link.style.cursor = 'pointer'; // Cambia el cursor a pointer

        link.addEventListener('click', (e) => {
            e.preventDefault(); // Previene la navegación por defecto

            // 3. Ejecutar la función de logout
            fetch('/api/logout', { 
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    alert(data.mensaje);
                    // Limpiar historial y redirigir
                    history.replaceState({ autenticado: false }, '');
                    window.location.replace('/login.html');
                }
            })
            .catch(error => {
                alert(error);
                console.error('Error al cerrar sesión:', error);
            });
        });
    }

    // Verificar estado de autenticación
    checkEstadoAutentificacion();

    async function checkEstadoAutentificacion() {
        try {
            const response = await fetch('/api/usuario');
            const data = await response.json();
            
            const paginasPublicas = [
                '/', 
                '/index.html', 
                '/contacto.html', 
                '/productos.html',
                '/login.html',
                '/registrar.html'
            ];
            
            const enPaginaPublica = paginasPublicas.some(pagina => 
                window.location.pathname.includes(pagina)
            );
    
            if (data.usuario) {
                // Usuario autenticado
                if(linkLogin) linkLogin.style.display = 'none';
                if(linkRegistrar) linkRegistrar.style.display = 'none';
                if(btnLogout) btnLogout.style.display = 'inline-block';
                if(saludoUsuario) {
                    saludoUsuario.style.display = 'inline-block';
                    saludoUsuario.style.color = 'yellow';
                    saludoUsuario.textContent = `Hola, ${data.usuario.nombre}`;
                }
            } else {
                // Usuario no autenticado
                if(enPaginaPublica) {
                    // Mostrar botones de login/registro solo en páginas públicas
                    if(linkLogin) linkLogin.style.display = 'inline-block';
                    if(linkRegistrar) linkRegistrar.style.display = 'inline-block';
                }
                if(btnLogout) btnLogout.style.display = 'none';
                if(saludoUsuario) saludoUsuario.style.display = 'none';     
            }
        } catch(err) {
            console.error('Error al verificar autenticación:', err);
        }
    }

    // Manejo del formulario de logueo
    const formularioLogin = document.getElementById('formulario-login');
    if(formularioLogin) {
        formularioLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // alert("Iniciar sesion");

            // Obtener valores
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const contenedorError = document.getElementById('mensaje-error') || crearContenedorError();

            // alert(`Correo: ${inputEmail.value}`);

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    window.location.href = '/';
                } else {
                    alert(data.error || 'Error al iniciar sesión');
                }
            } catch(err) {
                console.error('Error al iniciar sesión:', err);
                alert('Error al iniciar sesión');
            }
        });
    }

    // Manejo del formulario de registro
    const formularioRegistro = document.getElementById('formulario-registro');
    if(formularioRegistro) {
        formularioRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            //alert("Registrate a esta aplicación");

            // Obtener elementos del DOM
            const inputNombre = document.getElementById('nombre');
            const inputEmail = document.getElementById('email');
            const inputPassword = document.getElementById('password');
            const contenedorError = document.getElementById('mensaje-error') || crearContenedorError();

            // Resetear errores previos
            limpiarErrores();

            // Obtener valores
            const nombre = inputNombre.value.trim();
            const email = inputEmail.value.trim();
            const password = inputPassword.value.trim();

            // Bandera para las validaciones
            let esValido = true;

            // Validar nombre (solo letras y espacios)
            if(!nombre){
                mostrarError(inputNombre, 'El nombre es requerido');
                esValido = false;
            } else if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
                mostrarError(inputNombre, 'El nombre solo puede contener letras y espacios');
                esValido = false;
            }

            // Validar correo
            if(!email) {
                mostrarError(inputEmail, 'El correo es requerido');
                esValido = false;
            } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                mostrarError(inputEmail, 'Ingresa un email válido (ejemplo: user@domain.com)');
                esValido = false;
            }

            // Validar password
            if (!password) {
                mostrarError(inputPassword, 'La contraseña es requerida');
                esValido = false;
            } else if (password.length < 8) {
                mostrarError(inputPassword, 'La contraseña debe tener al menos 8 caracteres');
                esValido = false;
            }

            if (!esValido) {
                // Eliminar mensajes después de 5 segundos
                setTimeout(() => {
                    limpiarErrores();
                }, 5000);
                return;
            }

            try{
                const response = await fetch('/api/registrar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Registro exitoso
                    if (contenedorError) contenedorError.remove();
                    alert('Registro exitoso. Por favor inicia sesión.');
                    window.location.href = '/login.html';
                } else {
                    // Mensaje error específico de email duplicado
                    if (data.error === 'El correo electrónico ya está registrado') {
                        mostrarError(inputEmail, data.error);
                    } else {
                        // Error del servidor
                    mostrarErrorEnFormulario(data.error || 'Error al registrarse');
                    }    
                    // Eliminar mensajes después de 5 segundos
                    setTimeout(() => {
                        limpiarErrores();
                    }, 5000);
                }
            } catch(err) {
                console.error('Error al registrarse:', err);
                mostrarErrorEnFormulario(data.error || 'Error al registrarse');
                // Eliminar mensajes después de 5 segundos
                setTimeout(() => {
                    limpiarErrores();
                }, 5000);
            }
        })
    }

    // Métodos para el manejo de session
    
    async function verificarSesion() {
        try {
            const response = await fetch('/api/check-session');
            const data = await response.json();
            
            // Lista de páginas públicas que no requieren autenticación
            const paginasPublicas = [
                '/', 
                '/index.html', 
                '/contacto.html', 
                '/productos.html',
                '/login.html',
                '/registrar.html'
            ];
            
            const paginaActual = window.location.pathname;
            
            if (data.autentificado) {
                // Si está autenticado y está en login/registro, redirigir a la página principal
                if (paginaActual.includes('/login.html') || paginaActual.includes('/registro.html')) {
                    window.location.replace('/');
                }
                return true;
            } else {
                // Si no está autenticado y está intentando acceder a una página privada
                if (!paginasPublicas.some(pagina => paginaActual.includes(pagina))) {
                    window.location.replace('/login.html');
                }
                return false;
            }
        } catch (err) {
            console.error('Error al verificar sesión:', err);
            // Solo redirigir si no está en una página pública
            if (!paginasPublicas.some(pagina => window.location.pathname.includes(pagina))) {
                window.location.replace('/login.html');
            }
            return false;
        }
    }
    
    // Control mejorado del historial
    function configurarHistorial() {
        // Reemplazar el estado actual en lugar de añadir uno nuevo
        history.replaceState({ autenticado: true }, '');
        
        window.addEventListener('popstate', (event) => {
            // Verificar si el estado tiene la bandera de autenticación
            if (!event.state?.autenticado) {
                verificarSesion();
            }
            // Mantener el estado de autenticación
            history.replaceState({ autenticado: true }, '');
        });
    }
    
    
});

// Password:

/* 
jonathanvcc@gmail.com - 1234567890
juan@hotmail.com - 1234567891
*/