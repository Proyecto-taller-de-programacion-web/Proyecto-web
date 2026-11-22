/* =====================================================
   login.js — valida las credenciales y abre la sesión
   Depende de almacen.js
   ===================================================== */

// Se llama desde el HTML:  <form onsubmit="iniciarSesion(event)">
function iniciarSesion(event) {
  event.preventDefault(); // para que no se recargue la página al enviar

  let email = document.getElementById("login-email").value.trim().toLowerCase();
  let clave = document.getElementById("login-pass").value;

  // Se busca la cuenta recorriendo la lista de usuarios registrados
  let usuarios = leerDato(CLAVES.usuarios, []);
  let usuario = null;

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === email && usuarios[i].pass === clave) {
      usuario = usuarios[i];
    }
  }

  if (usuario === null) {
    document.getElementById("mgError").innerHTML =
      "Correo o contraseña incorrectos. ¿Ya creaste tu cuenta?";
    return;
  }

  document.getElementById("mgError").innerHTML = "";

  // abrirSesion (almacen.js) guarda la sesión y redirige según el rol:
  //   admin   -> panel de administrador
  //   usuario -> a su reserva a medias (paso 4) o al inicio
  abrirSesion(usuario);
}
