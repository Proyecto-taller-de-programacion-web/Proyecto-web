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


// Reservas de demostración. Se mantienen en memoria mientras esta página esté abierta.
const reservas = [
    {
        correo: "beto@mail.com",
        mesaId: 13,
        fecha: "2026-11-28",
        horaInicio: "12:00",
        horaFin: "14:00",
        estado: "confirmada"
    },
    {
        correo: "cami@mail.com",
        mesaId: 13,
        fecha: "2026-11-28",
        horaInicio: "18:00",
        horaFin: "20:00",
        estado: "confirmada"
    }
];

const DURACION_RESERVA_MIN = 120;
let mesaSeleccionada = null;
let horarioSeleccionado = null;
// Simulación de sesión: el login devuelve a esta página con ?logueado=1.
let usuarioLogueado = location.search.includes("logueado=1");
let reservaPendiente = null;
let reservaActiva = null;

const contenedor = document.getElementById("contenedor-horarios");
const selectorPersonas = document.getElementById("numero-personas");
const selectorFecha = document.getElementById("fecha-reserva");

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

function hayCruce(inicioNuevo, finNuevo, inicioExistente, finExistente) {
    return horaAMinutos(inicioNuevo) < horaAMinutos(finExistente) &&
        horaAMinutos(finNuevo) > horaAMinutos(inicioExistente);
}

function mesaEstaLibre(mesaId, fecha, horaInicio, horaFin) {
    for (let i = 0; i < reservas.length; i++) {
        let reserva = reservas[i];

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

// Primero se valida el horario. Si no hay sesión simulada, se envía al login.
// Al regresar con ?logueado=1, podrá avanzar al paso 4.
function guardarDatos() {
    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        return;
    }

    if (!usuarioLogueado) {
        location.href = "../0. login/index.html";
        return;
    }

    document.getElementById("paso4").checked = true;
}

document.querySelectorAll('input[name="sede"], input[name="zona"]').forEach(function (radio) {
    radio.addEventListener("change", mostrarHorarios);
});

selectorPersonas.addEventListener("change", mostrarHorarios);
selectorFecha.addEventListener("change", mostrarHorarios);

function nombreSede(valor) {
    switch (valor) {
        case "san-isidro": return "San Isidro";
        case "miraflores": return "Miraflores";
        default: return valor;
    }
}

function nombreSalon(valor) {
    switch (valor) {
        case "salon-principal": return "Salón Principal";
        case "lounge": return "Lounge";
        case "terraza-alta": return "Terraza Alta";
        default: return valor;
    }
}

function fechaDeHoy() {
    const hoy = new Date();
    let mes = hoy.getMonth() + 1;
    let dia = hoy.getDate();

    if (mes < 10) mes = "0" + mes;
    if (dia < 10) dia = "0" + dia;

    return hoy.getFullYear() + "-" + mes + "-" + dia;
}

function buscarReservaActiva(correo) {
    for (let i = 0; i < reservas.length; i++) {
        if (reservas[i].correo === correo &&
            reservas[i].estado === "confirmada" &&
            reservas[i].fecha >= fechaDeHoy()) {
            return reservas[i];
        }
    }
    return null;
}

function bloquearSiTieneReserva() {
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const activa = buscarReservaActiva(correo);

    if (activa === null) return false;

    reservaActiva = activa;
    document.getElementById("cajaReservaActiva").innerHTML = reporteReservaActiva(activa);

    const modal = document.getElementById("modalReservaActiva");
    if (!modal.open) modal.showModal();

    return true;
}

function finalizarReserva(evento) {
    evento.preventDefault();

    if (bloquearSiTieneReserva()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        document.getElementById("paso3").checked = true;
        return;
    }

    const filtros = obtenerFiltros();
    const horaFin = calcularHoraFin(horarioSeleccionado);

    if (!mesaEstaLibre(mesaSeleccionada.id, filtros.fecha, horarioSeleccionado, horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    const reserva = {
        correo: document.getElementById("correo").value.trim().toLowerCase(),
        mesaId: mesaSeleccionada.id,
        fecha: filtros.fecha,
        horaInicio: horarioSeleccionado,
        horaFin: horaFin,
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
        }
    };

    reservaPendiente = reserva;
    document.getElementById("cajaResumen").innerHTML = reporteReserva(reserva, true);
    document.getElementById("modalResumen").showModal();
}

function confirmarReserva() {
    document.getElementById("modalResumen").close();

    if (reservaPendiente === null) return;

    if (bloquearSiTieneReserva()) return;

    if (!mesaEstaLibre(reservaPendiente.mesaId, reservaPendiente.fecha,
        reservaPendiente.horaInicio, reservaPendiente.horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    reservas.push(reservaPendiente);
    reservaPendiente = null;

    window.location.href = "confirmacion.html";
}

function formatearFecha(fecha) {
    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function escaparHTML(texto) {
    let resultado = "";

    for (let i = 0; i < texto.length; i++) {
        let letra = texto[i];

        if (letra === "<") resultado += "&lt;";
        else if (letra === ">") resultado += "&gt;";
        else if (letra === "&") resultado += "&amp;";
        else resultado += letra;
    }
    return resultado;
}

function reporteReserva(reserva, completo) {
    let cad = `<h3 class="modal-seccion">Detalle de la reserva</h3>`;

    cad += `
        <p><strong>Sede</strong><span>${reserva.sede} - ${reserva.salon}</span></p>
        <p><strong>Mesa</strong><span>N.º ${reserva.mesaId}</span></p>
        <p><strong>Fecha</strong><span>${formatearFecha(reserva.fecha)}</span></p>
        <p><strong>Horario</strong><span>${reserva.horaInicio} - ${reserva.horaFin}</span></p>
        <p><strong>Personas</strong><span>${reserva.personas}</span></p>
        <h3 class="modal-seccion">Titular</h3>
        <p><strong>Nombre</strong><span>${escaparHTML(reserva.titular.nombre)} ${escaparHTML(reserva.titular.apellido)}</span></p>
    `;

    if (completo) {
        cad += `
            <p><strong>Correo</strong><span>${escaparHTML(reserva.titular.correo)}</span></p>
            <p><strong>Teléfono</strong><span>${escaparHTML(reserva.titular.telefono)}</span></p>
            <h3 class="modal-seccion">Información adicional</h3>
            <p><strong>Motivo</strong><span>${escaparHTML(reserva.adicional.motivo) || "—"}</span></p>
            <p><strong>Requerimiento</strong><span>${escaparHTML(reserva.adicional.requerimiento) || "—"}</span></p>
            <p><strong>Necesidad</strong><span>${escaparHTML(reserva.adicional.necesidad) || "—"}</span></p>
            <p><strong>Alergias</strong><span>${escaparHTML(reserva.adicional.alergias) || "—"}</span></p>
        `;
    }
    return cad;
}

function reporteReservaActiva(reserva) {
    let cad = `
        <h3 class="modal-seccion">Detalle de la reserva</h3>
        <p><strong>Correo</strong><span>${escaparHTML(reserva.correo)}</span></p>
        <p><strong>Mesa</strong><span>N.º ${reserva.mesaId}</span></p>
        <p><strong>Fecha</strong><span>${formatearFecha(reserva.fecha)}</span></p>
        <p><strong>Horario</strong><span>${reserva.horaInicio} - ${reserva.horaFin}</span></p>
    `;
    return cad;
}

function cancelarReserva() {
    let respuesta = confirm("¿Estás seguro de cancelar tu reserva?");

    if (respuesta === true && reservaActiva !== null) {
        reservaActiva.estado = "cancelada";
        reservaActiva = null;
        document.getElementById("modalReservaActiva").close();
        alert("Reserva cancelada.");
    } else {
        alert("Acción cancelada.");
    }
}

function irAlInicio() {
    window.location.href = "../../index.html";
}

function limpiarReserva() {
    horarioSeleccionado = null;
    mesaSeleccionada = null;
    reservaPendiente = null;
    contenedor.innerHTML = "";
}