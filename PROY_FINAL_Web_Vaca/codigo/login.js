/* =====================================================
   login.js — valida las credenciales y abre la sesión
   Depende de almacen.js
   ===================================================== */

// Se llama desde el HTML:  <form onsubmit="iniciarSesion(event)">
function iniciarSesion(event) {
  event.preventDefault();

  let email = document.getElementById("login-email").value.trim().toLowerCase();
  let clave = document.getElementById("login-pass").value;
  let usuario = null;

  // Se busca la cuenta recorriendo la lista de usuarios
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === email && usuarios[i].pass === clave) {
      usuario = usuarios[i];
    }
  }

  if (usuario === null) {
    document.getElementById("mgError").innerHTML = "Correo o contraseña incorrectos.";
    return;
  }

  document.getElementById("mgError").innerHTML = "";

  // admin -> panel | usuario -> reservar
  abrirSesion(usuario);
}
