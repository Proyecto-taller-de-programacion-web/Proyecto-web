/* =====================================================
   registro.js — crea la cuenta y la guarda en localStorage
   Depende de almacen.js
   ===================================================== */

// Se llama desde el HTML:  <form onsubmit="registrarUsuario(event)">
function registrarUsuario(event) {
  event.preventDefault(); // para que no se recargue la página al enviar

  let nombre = document.getElementById("nombre").value.trim();
  let apellido = document.getElementById("apellido").value.trim();
  let correo = document.getElementById("correo").value.trim().toLowerCase();
  let telefono = document.getElementById("telefono").value.trim();
  let pass = document.getElementById("pass").value;
  let pass2 = document.getElementById("pass2").value;

  // Validaciones: el mensaje sale en el div "mgError"
  if (pass !== pass2) {
    document.getElementById("mgError").innerHTML = "Las contraseñas no coinciden.";
    return;
  }

  // Se revisa, recorriendo la lista, si el correo ya estaba registrado
  let usuarios = leerDato(CLAVES.usuarios, []);
  let existe = false;

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === correo) {
      existe = true;
    }
  }

  if (existe === true) {
    document.getElementById("mgError").innerHTML =
      "Este correo ya está registrado. Inicia sesión.";
    return;
  }

  document.getElementById("mgError").innerHTML = "";

  usuarios.push({
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    telefono: telefono,
    pass: pass // OJO: solo válido para un proyecto de curso sin servidor
  });
  guardarDato(CLAVES.usuarios, usuarios);

  // Cuenta creada -> al login (la reserva temporal, si hay, sigue guardada)
  location.href = "../0. login/index.html";
}
