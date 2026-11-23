// ==========================================
// LA VACA ROJA - RESERVAS
// ==========================================

// La última mesa de cada zona es la mesa grande: tiene capacidad para 15 personas.
// (buscarMesaDisponible toma la primera mesa del arreglo que alcance, por eso
// las mesas grandes van al final de cada zona.)
const mesas = [


    // ------------------------ Sede: MIRAFLORES --------------------

    // MIRAFLORES - SALÓN PRINCIPAL
    { id: 1, sede: "miraflores", salon: "salon-principal", capacidad: 2 },
    { id: 2, sede: "miraflores", salon: "salon-principal", capacidad: 2 },
    { id: 3, sede: "miraflores", salon: "salon-principal", capacidad: 4 },
    { id: 4, sede: "miraflores", salon: "salon-principal", capacidad: 4 },
    { id: 5, sede: "miraflores", salon: "salon-principal", capacidad: 15 },

    // MIRAFLORES - LOUNGE
    { id: 6, sede: "miraflores", salon: "lounge", capacidad: 2 },
    { id: 7, sede: "miraflores", salon: "lounge", capacidad: 4 },
    { id: 8, sede: "miraflores", salon: "lounge", capacidad: 6 },
    { id: 9, sede: "miraflores", salon: "lounge", capacidad: 15 },

    // MIRAFLORES - TERRAZA ALTA
    { id: 10, sede: "miraflores", salon: "terraza-alta", capacidad: 2 },
    { id: 11, sede: "miraflores", salon: "terraza-alta", capacidad: 4 },
    { id: 12, sede: "miraflores", salon: "terraza-alta", capacidad: 6 },
    { id: 13, sede: "miraflores", salon: "terraza-alta", capacidad: 15 },

    // ------------------------ Sede: SAN ISIDRO --------------------

    // SAN ISIDRO - SALÓN PRINCIPAL
    { id: 14, sede: "san-isidro", salon: "salon-principal", capacidad: 2 },
    { id: 15, sede: "san-isidro", salon: "salon-principal", capacidad: 2 },
    { id: 16, sede: "san-isidro", salon: "salon-principal", capacidad: 4 },
    { id: 17, sede: "san-isidro", salon: "salon-principal", capacidad: 4 },
    { id: 18, sede: "san-isidro", salon: "salon-principal", capacidad: 6 },
    { id: 19, sede: "san-isidro", salon: "salon-principal", capacidad: 15 },

    // SAN ISIDRO - LOUNGE
    { id: 20, sede: "san-isidro", salon: "lounge", capacidad: 2 },
    { id: 21, sede: "san-isidro", salon: "lounge", capacidad: 4 },
    { id: 22, sede: "san-isidro", salon: "lounge", capacidad: 6 },
    { id: 23, sede: "san-isidro", salon: "lounge", capacidad: 15 },

    // SAN ISIDRO - TERRAZA ALTA
    { id: 24, sede: "san-isidro", salon: "terraza-alta", capacidad: 2 },
    { id: 25, sede: "san-isidro", salon: "terraza-alta", capacidad: 4 },
    { id: 26, sede: "san-isidro", salon: "terraza-alta", capacidad: 6 },
    { id: 27, sede: "san-isidro", salon: "terraza-alta", capacidad: 8 },
    { id: 28, sede: "san-isidro", salon: "terraza-alta", capacidad: 15 }

];

// Reservas de demostración. Las reservas confirmadas ocupan mesa.
// (Las reservas reales están en "registros", que se guarda en LocalStorage: almacen.js)
const reservas = [
    { mesaId: 13, fecha: "2026-11-28", horaInicio: "12:00", horaFin: "14:00", estado: "confirmada" },
    { mesaId: 13, fecha: "2026-11-28", horaInicio: "18:00", horaFin: "20:00", estado: "confirmada" }
];

const DURACION_RESERVA_MIN = 120;
const MAX_RESERVAS_POR_DIA = 2;
const MAX_RESERVAS_TOTAL = 3;
let mesaSeleccionada = null;
let horarioSeleccionado = null;
let reservaPendiente = null;

const contenedor = document.getElementById("contenedor-horarios");
const selectorPersonas = document.getElementById("numero-personas");
const selectorFecha = document.getElementById("fecha-reserva");

// El calendario no deja elegir días anteriores a hoy
selectorFecha.min = fechaDeHoy();

function obtenerValorRadio(nombre) {
    const seleccionado = document.querySelector(`input[name="${nombre}"]:checked`);
    return seleccionado ? seleccionado.value : "";
}

function obtenerFiltros() {
    return {
        sede: obtenerValorRadio("sede"),
        salon: obtenerValorRadio("zona"),
        personas: Number(selectorPersonas.value),
        fecha: selectorFecha.value
    };
}


function horaAMinutos(hora) {
    const partes = hora.split(":");
    return Number(partes[0]) * 60 + Number(partes[1]);
}

function minutosAHora(totalMinutos) {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0");
}

function calcularHoraFin(horaInicio) {
    return minutosAHora(horaAMinutos(horaInicio) + DURACION_RESERVA_MIN);
}

function obtenerHorarios(fecha) {
    const dia = new Date(fecha + "T00:00:00Z").getUTCDay();
    if (dia === 1) return [];

    const ultimoInicio = dia === 0 ? 17 : 20;
    const horarios = [];

    for (let hora = 12; hora <= ultimoInicio; hora++) {
        horarios.push(String(hora).padStart(2, "0") + ":00");
    }
    return horarios;
}

//--------------------------------  PARTE 2 --------------------------------

function hayCruce(inicioNuevo, finNuevo, inicioExistente, finExistente) {
    return horaAMinutos(inicioNuevo) < horaAMinutos(finExistente) &&
        horaAMinutos(finNuevo) > horaAMinutos(inicioExistente);
}

// Revisa una lista de reservas: devuelve false si la mesa está ocupada en ese horario
function revisarLista(lista, mesaId, fecha, horaInicio, horaFin) {
    for (let i = 0; i < lista.length; i++) {
        let reserva = lista[i];

        if (reserva.mesaId === mesaId &&
            reserva.fecha === fecha &&
            reserva.estado === "confirmada") {

            if (hayCruce(horaInicio, horaFin, reserva.horaInicio, reserva.horaFin)) {
                return false;
            }
        }
    }
    return true;
}

// La mesa debe estar libre en las reservas de demostración y en las guardadas
function mesaEstaLibre(mesaId, fecha, horaInicio, horaFin) {
    return revisarLista(reservas, mesaId, fecha, horaInicio, horaFin) &&
        revisarLista(registros, mesaId, fecha, horaInicio, horaFin);
}

function buscarMesaDisponible(filtros, horaInicio) {
    const horaFin = calcularHoraFin(horaInicio);

    for (let i = 0; i < mesas.length; i++) {
        let mesa = mesas[i];

        if (mesa.sede === filtros.sede &&
            mesa.salon === filtros.salon &&
            mesa.capacidad >= filtros.personas) {

            if (mesaEstaLibre(mesa.id, filtros.fecha, horaInicio, horaFin)) {
                return mesa;
            }
        }
    }
    return null;
}

function seleccionarHorario(hora, mesa) {
    horarioSeleccionado = hora;
    mesaSeleccionada = mesa;

    const botones = document.querySelectorAll("#contenedor-horarios .horario");
    for (let i = 0; i < botones.length; i++) {
        botones[i].classList.remove("seleccionado");
    }

    const botonElegido = document.querySelector(
        `#contenedor-horarios button[data-hora="${hora}"]`
    );

    if (botonElegido) {
        botonElegido.classList.add("seleccionado");
    }
}

function mostrarHorarios() {
    contenedor.innerHTML = "";
    horarioSeleccionado = null;
    mesaSeleccionada = null;

    const filtros = obtenerFiltros();

    if (!filtros.sede || !filtros.salon || !filtros.personas || !filtros.fecha) {
        contenedor.textContent = "Completa los cuatro filtros para consultar.";
        return;
    }

    const horarios = obtenerHorarios(filtros.fecha);

    if (horarios.length === 0) {
        contenedor.textContent = "No hay reservas disponibles para ese día.";
        return;
    }

    for (let i = 0; i < horarios.length; i++) {
        let hora = horarios[i];
        let mesa = buscarMesaDisponible(filtros, hora);
        let boton = document.createElement("button");

        boton.type = "button";
        boton.classList.add("horario");
        boton.textContent = hora;
        boton.dataset.hora = hora;

        if (mesa !== null) {
            boton.classList.add("disponible");
            boton.setAttribute("aria-label", hora + ", disponible");
            boton.onclick = function () {
                seleccionarHorario(hora, mesa);
            };
        } else {
            boton.classList.add("ocupado");
            boton.disabled = true;
            boton.textContent = hora + " · No disponible";
        }

        contenedor.appendChild(boton);
    }
}

document.querySelectorAll('input[name="sede"], input[name="zona"]').forEach(function (radio) {
    radio.addEventListener("change", mostrarHorarios);
});

selectorPersonas.addEventListener("change", mostrarHorarios);
selectorFecha.addEventListener("change", mostrarHorarios);


function validarPaso2() {
    if (!selectorFecha.value || !selectorPersonas.value) {
        alert("Elige el número de personas y la fecha.");
        return;
    }

    if (selectorFecha.value < fechaDeHoy()) {
        alert("Elige una fecha desde hoy en adelante.");
        return;
    }

    document.getElementById("paso3").checked = true;
}

//--------------------------------  PARTE 3 --------------------------------

// SIGUIENTE del paso 3: valida el horario y la sesión. Si todo está bien, pasa al paso 4.
function guardarDatos() {
    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        return;
    }

    const sesion = obtenerSesion();

    if (sesion === null) {
        // Se guarda lo elegido ANTES de ir al login, para devolverlo luego a este punto
        const filtros = obtenerFiltros();
        guardarReservaTemporal({
            sede: filtros.sede,
            salon: filtros.salon,
            personas: filtros.personas,
            fecha: filtros.fecha,
            horario: horarioSeleccionado
        });

        document.getElementById("modalLogin").showModal();
        return;
    }

    if (sesion.rol === "admin") {
        alert("Las cuentas de administrador solo pueden consultar las reservas. Usa una cuenta de cliente para reservar.");
        return;
    }

    if (llegoAlLimite()) return;

    rellenarTitular(sesion);
    document.getElementById("paso4").checked = true;
}

// Botones de la ventana "Por favor, inicia sesión"
function cerrarModalLogin() {
    document.getElementById("modalLogin").close();
}

function irAlLogin() {
    location.href = "../0. login/index.html";
}

// Al volver del login (?continuar=1): se ponen de nuevo los datos que había elegido
// y se le devuelve al paso 4, donde se había quedado.
function restaurarReserva() {
    const guardada = obtenerReservaTemporal();
    const sesion = obtenerSesion();

    if (guardada === null || sesion === null || sesion.rol !== "usuario") return;

    document.querySelector(`input[name="sede"][value="${guardada.sede}"]`).checked = true;
    document.querySelector(`input[name="zona"][value="${guardada.salon}"]`).checked = true;
    selectorPersonas.value = guardada.personas;
    selectorFecha.value = guardada.fecha;
    mostrarHorarios();
    borrarReservaTemporal();

    // Si la cuenta ya llegó a su límite, llegoAlLimite() avisa y no deja seguir
    document.getElementById("paso3").checked = true;
    if (llegoAlLimite()) return;

    const mesa = buscarMesaDisponible(obtenerFiltros(), guardada.horario);

    if (mesa === null) {
        alert("El horario que elegiste ya no está disponible. Elige otro.");
        return;
    }

    seleccionarHorario(guardada.horario, mesa);
    rellenarTitular(sesion);
    document.getElementById("paso4").checked = true;
}

// Pone en el paso 4 los datos de la cuenta
function rellenarTitular(sesion) {
    document.getElementById("nombre").value = sesion.nombre;
    document.getElementById("apellido").value = sesion.apellido;
    document.getElementById("correo").value = sesion.correo;
    document.getElementById("telefono").value = sesion.telefono;
}

function nombreSede(valor) {
    if (valor === "san-isidro") return "San Isidro";
    if (valor === "miraflores") return "Miraflores";
    return valor;
}

function nombreSalon(valor) {
    if (valor === "salon-principal") return "Salón Principal";
    if (valor === "lounge") return "Lounge";
    if (valor === "terraza-alta") return "Terraza Alta";
    return valor;
}

//--------------------------------  LÍMITES: 3 EN TOTAL Y 2 POR DÍA --------------------------------

// Devuelve true si la cuenta NO puede reservar (y avisa por qué).
// "Vigente" = reserva de hoy en adelante.
function llegoAlLimite() {
    const sesion = obtenerSesion();
    const fecha = selectorFecha.value;
    const hoy = fechaDeHoy();
    let vigentes = [];
    let delDia = 0;

    for (let i = 0; i < registros.length; i++) {
        let r = registros[i];

        if (r.usuario === sesion.correo && estadoReserva(r) === "confirmada") {
            vigentes.push(r);

            if (r.fecha === fecha) {
                delDia++;
            }
        }
    }

    if (vigentes.length >= MAX_RESERVAS_TOTAL) {
        mostrarListaLimite(vigentes);
        return true;
    }

    if (delDia >= MAX_RESERVAS_POR_DIA) {
        alert("Ya tienes " + MAX_RESERVAS_POR_DIA + " reservas para el " + formatearFecha(fecha) +
            ". Solo se permiten " + MAX_RESERVAS_POR_DIA + " por día: elige otro día.");
        document.getElementById("paso2").checked = true;
        return true;
    }

    return false;
}

// Ventana con las reservas vigentes, cada una con su botón "Cancelar"
function mostrarListaLimite(vigentes) {
    let cad = "";

    for (let i = 0; i < vigentes.length; i++) {
        let r = vigentes[i];
        cad += `
            <div class="fila-reserva">
                <div>
                    <strong>${formatearFecha(r.fecha)} · ${r.horaInicio}</strong>
                    <span>${r.sede} - ${r.salon} · Mesa ${r.mesaId}</span>
                </div>
                <button type="button" class="btn-fila" onclick="cancelarReserva('${r.id}')">Cancelar</button>
            </div>
        `;
    }

    document.getElementById("cajaReservaActiva").innerHTML = cad;
    document.getElementById("modalReservaActiva").showModal();
}

// Botón "Cancelar" de una reserva de la lista (igual que confirEliminar de clase)
function cancelarReserva(id) {
    let respuesta = confirm("¿Estás seguro de cancelar esta reserva?");

    if (respuesta === true) {
        // La reserva no se borra: pasa a "cancelada" para conservar el historial
        for (let i = 0; i < registros.length; i++) {
            if (registros[i].id === id) {
                registros[i].estado = "cancelada";
            }
        }

        guardarEnStorage();

        alert("Reserva cancelada");
        document.getElementById("modalReservaActiva").close();
        mostrarHorarios(); // la mesa vuelve a quedar libre
    } else {
        alert("Acción cancelada");
    }
}

function irAlInicio() {
    window.location.href = "../../index.html";
}

//--------------------------------  PASO 6: PAGO (simulado) --------------------------------

// Deja solo los números de un texto
function soloNumeros(texto) {
    let numeros = "";

    for (let i = 0; i < texto.length; i++) {
        if (texto[i] >= "0" && texto[i] <= "9") {
            numeros += texto[i];
        }
    }
    return numeros;
}

// Número de tarjeta: se escribe seguido y se separa solo en grupos de 4 (0000 0000 0000 0000)
function formatearTarjeta(evento) {
    const numeros = soloNumeros(evento.target.value);
    let grupos = "";

    for (let i = 0; i < numeros.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            grupos += " ";
        }
        grupos += numeros[i];
    }

    evento.target.value = grupos;
}

// Vencimiento: pone sola la "/" después del mes (MM/AA)
function formatearVence(evento) {
    let texto = soloNumeros(evento.target.value).slice(0, 4);

    // Al borrar con la tecla de retroceso no se vuelve a poner la "/"
    if (texto.length > 2 || (texto.length === 2 && evento.inputType !== "deleteContentBackward")) {
        texto = texto.slice(0, 2) + "/" + texto.slice(2);
    }

    evento.target.value = texto;
}

// El número de tarjeta (4 grupos de 4 dígitos) y el CVV (3 dígitos) ya los valida el HTML
// con pattern. Aquí solo se revisa que la tarjeta no esté vencida.
// Ni el número completo ni el CVV se guardan: solo los últimos 4 dígitos.
function validarPago() {
    const vence = document.getElementById("vence-tarjeta").value; // MM/AA
    const partes = vence.split("/");
    const mes = Number(partes[0]);
    const anio = 2000 + Number(partes[1]);
    const hoy = new Date();

    if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
        document.getElementById("msgVence").innerHTML = "La tarjeta está vencida.";
        return false;
    }

    document.getElementById("msgVence").innerHTML = "";
    return true;
}

//--------------------------------  PARTE 4  --------------------------------

function finalizarReserva(evento) {
    evento.preventDefault();

    const sesion = obtenerSesion();

    if (sesion === null || sesion.rol === "admin") {
        alert("Inicia sesión con una cuenta de cliente para reservar.");
        return;
    }

    if (llegoAlLimite()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        document.getElementById("paso3").checked = true;
        return;
    }

    if (validarPago() === false) return;

    const filtros = obtenerFiltros();
    const tarjeta = document.getElementById("numero-tarjeta").value;

    const reserva = {
        usuario: sesion.correo,
        mesaId: mesaSeleccionada.id,
        fecha: filtros.fecha,
        horaInicio: horarioSeleccionado,
        horaFin: calcularHoraFin(horarioSeleccionado),
        estado: "confirmada",
        sede: nombreSede(filtros.sede),
        salon: nombreSalon(filtros.salon),
        personas: filtros.personas,
        titular: {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim()
        },
        adicional: {
            motivo: document.getElementById("motivo-reserva").value.trim(),
            requerimiento: document.getElementById("requerimiento").value.trim(),
            necesidad: document.getElementById("necesidad").value.trim(),
            alergias: document.getElementById("alergias").value.trim()
        },
        pago: {
            metodo: "Tarjeta",
            ultimos4: tarjeta.slice(-4)
        }
    };

    // Todavía no se guarda: primero se muestra el resumen en una ventana modal
    reservaPendiente = reserva;
    document.getElementById("cajaResumen").innerHTML = reporteReserva(reserva);
    document.getElementById("modalResumen").showModal();
}

// Botón "Reservar" de la ventana del resumen: recién aquí se guarda
function confirmarReserva() {
    document.getElementById("modalResumen").close();

    if (reservaPendiente === null) return;

    // Última comprobación: que nadie haya tomado la mesa mientras tanto
    if (!mesaEstaLibre(reservaPendiente.mesaId, reservaPendiente.fecha,
        reservaPendiente.horaInicio, reservaPendiente.horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    reservaPendiente.id = "VR-" + Date.now();

    registros.push(reservaPendiente);
    guardarEnStorage();
    reservaPendiente = null;

    window.location.href = "confirmacion.html";
}

//--------------------------------  RESUMEN DE LA RESERVA --------------------------------

// Se arma con comillas invertidas y se muestra con innerHTML (como "cajaReporte" de clase)
function reporteReserva(reserva) {
    let cad = `
        <h3 class="modal-seccion">Detalle de la reserva</h3>
        <p><strong>Sede</strong><span>${reserva.sede} - ${reserva.salon}</span></p>
        <p><strong>Mesa</strong><span>N.º ${reserva.mesaId}</span></p>
        <p><strong>Fecha</strong><span>${formatearFecha(reserva.fecha)}</span></p>
        <p><strong>Horario</strong><span>${reserva.horaInicio} - ${reserva.horaFin}</span></p>
        <p><strong>Personas</strong><span>${reserva.personas}</span></p>

        <h3 class="modal-seccion">Titular</h3>
        <p><strong>Nombre</strong><span>${escaparHTML(reserva.titular.nombre)} ${escaparHTML(reserva.titular.apellido)}</span></p>
        <p><strong>Correo</strong><span>${escaparHTML(reserva.titular.correo)}</span></p>
        <p><strong>Teléfono</strong><span>${escaparHTML(reserva.titular.telefono)}</span></p>

        <h3 class="modal-seccion">Información adicional</h3>
        <p><strong>Motivo</strong><span>${escaparHTML(reserva.adicional.motivo) || "—"}</span></p>
        <p><strong>Requerimiento</strong><span>${escaparHTML(reserva.adicional.requerimiento) || "—"}</span></p>
        <p><strong>Necesidad</strong><span>${escaparHTML(reserva.adicional.necesidad) || "—"}</span></p>
        <p><strong>Alergias</strong><span>${escaparHTML(reserva.adicional.alergias) || "—"}</span></p>

        <h3 class="modal-seccion">Pago</h3>
        <p><strong>Método</strong><span>${reserva.pago.metodo} •••• ${reserva.pago.ultimos4}</span></p>
    `;
    return cad;
}

// "Limpiar formulario": también descarta el horario elegido
function limpiarReserva() {
    horarioSeleccionado = null;
    mesaSeleccionada = null;
    reservaPendiente = null;
    borrarReservaTemporal();
    contenedor.innerHTML = "";
    document.getElementById("msgVence").innerHTML = "";
}

//--------------------------------  AL ABRIR LA PÁGINA --------------------------------

// Si viene del login (?continuar=1) recupera lo que estaba armando; si no, se descarta
if (location.search.indexOf("continuar=1") !== -1) {
    restaurarReserva();
} else {
    borrarReservaTemporal();
}
