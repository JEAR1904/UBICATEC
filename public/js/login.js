const formulario = document.querySelector('#form-login');
const numeroControl = document.querySelector('#numero-control');
const password = document.querySelector('#password');
const boton = document.querySelector('#btn-login');
const mensajeError = document.querySelector('#login-error');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  mensajeError.hidden = true;
  boton.disabled = true;
  boton.textContent = 'Iniciando sesión...';

  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        numero_control: numeroControl.value.trim(),
        password: password.value
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error || 'No se pudo iniciar sesión'
      );
    }

    window.location.replace('/');

  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.hidden = false;
    password.value = '';
    password.focus();

  } finally {
    boton.disabled = false;
    boton.textContent = 'Iniciar sesión';
  }
});