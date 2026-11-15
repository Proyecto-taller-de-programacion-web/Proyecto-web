// Cuentas de ejemplo para practicar arreglos, objetos, ciclos y condicionales.
// Como el proyecto no utiliza almacenamiento, estas cuentas están escritas aquí.
const usuarios = [
    { nombre: "Beto", correo: "beto@gmail.com", pass: "123" },
    { nombre: "Ana", correo: "ana@gmail.com", pass: "123" }
];

function iniciarSesion(event) {
    event.preventDefault();

    let email = document.getElementById("login-email").value.trim().toLowerCase();
    let clave = document.getElementById("login-pass").value;
    let usuario = null;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].correo === email && usuarios[i].pass === clave) {
            usuario = usuarios[i];
            break;
        }
    }

    if (usuario === null) {
        document.getElementById("mgError").innerHTML =
            "Correo o contraseña incorrectos.";
        return;
    }

    document.getElementById("mgError").innerHTML = "";
    alert("Bienvenido(a), " + usuario.nombre + "!  :)");

    // Simulación de sesión: regresamos a reservas con una marca en la URL.
    location.href = "../5. reservar/index.html?logueado=1";
}
