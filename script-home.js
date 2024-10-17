// Verificar si el usuario está autenticado
const isAuthenticated = localStorage.getItem("isAuthenticated");
if (!isAuthenticated || isAuthenticated !== "true") {
    window.location.href = "index.html";
}

// Función para cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "index.html";
});

// Formatear fecha y hora en formato latinoamericano
function formatearFechaHora(fechaHoraISO) {
    const fecha = new Date(fechaHoraISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos} hs`;
}

// Agregar más campos de modelo dinámicamente
document.getElementById("addModelBtn").addEventListener("click", function() {
    const modelosContainer = document.getElementById("modelosContainer");
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "modelo";
    newInput.placeholder = "Ej: 15";
    newInput.required = true;
    modelosContainer.appendChild(newInput);
});

// Función para registrar computadoras
document.getElementById("computerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const responsable = document.getElementById("responsable").value;
    const curso = document.getElementById("curso").value;
    const prestador = document.getElementById("prestador").value;
    const fechaHora = document.getElementById("fechaHora").value;

    const modelos = Array.from(document.querySelectorAll(".modelo")).map(input => input.value);

    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];

    modelos.forEach(modelo => {
        const computadora = { responsable, curso, modelo, prestador, fechaHora };
        computadoras.push(computadora);
        // Registrar en Excel como "Ingreso"
        registrarEnExcel([computadora], "Ingreso");
    });

    localStorage.setItem("computadoras", JSON.stringify(computadoras));
    alert("Computadoras registradas correctamente");
    document.getElementById("computerForm").reset();
    document.getElementById("modelosContainer").innerHTML = '<input type="text" class="modelo" placeholder="Ej: 15" required>';
    mostrarComputadoras();
});

// Función para mostrar las computadoras en la tabla
function mostrarComputadoras() {
    const computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const tableBody = document.querySelector("#computerTable tbody");
    tableBody.innerHTML = "";

    computadoras.forEach(function(computadora, index) {
        const row = document.createElement("tr");

        const responsableCell = document.createElement("td");
        responsableCell.textContent = computadora.responsable;

        const cursoCell = document.createElement("td");
        cursoCell.textContent = computadora.curso;

        const modeloCell = document.createElement("td");
        modeloCell.textContent = computadora.modelo;

        const prestadorCell = document.createElement("td");
        prestadorCell.textContent = computadora.prestador;

        const fechaHoraCell = document.createElement("td");
        fechaHoraCell.textContent = formatearFechaHora(computadora.fechaHora);

        const accionesCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.addEventListener("click", function() {
            eliminarComputadora(index, computadora);
        });
        accionesCell.appendChild(deleteBtn);

        row.appendChild(responsableCell);
        row.appendChild(cursoCell);
        row.appendChild(modeloCell);
        row.appendChild(prestadorCell);
        row.appendChild(fechaHoraCell);
        row.appendChild(accionesCell);

        tableBody.appendChild(row);
    });
}

// Función para eliminar computadora
function eliminarComputadora(index, computadora) {
    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const eliminada = computadoras.splice(index, 1)[0];
    localStorage.setItem("computadoras", JSON.stringify(computadoras));
    mostrarComputadoras();

    const fechaHoraEliminacion = new Date().toISOString();
    eliminada.fechaHoraEliminacion = fechaHoraEliminacion;
    registrarEnExcel([eliminada], "Egreso");
}

// Función para eliminar todas las computadoras
document.getElementById("clearAllBtn").addEventListener("click", function() {
    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const fechaHoraEliminacion = new Date().toISOString();
    computadoras.forEach(computadora => computadora.fechaHoraEliminacion = fechaHoraEliminacion);
    registrarEnExcel(computadoras, "Egreso");

    localStorage.removeItem("computadoras");
    mostrarComputadoras();
});

// Función para registrar en Excel
function registrarEnExcel(datos, tipo) {
    const workbook = XLSX.utils.book_new();
    const headers = ["Responsable", "Curso", "N° Notebook", "Prestador", "Fecha/Hora", "Tipo"];
    const rows = datos.map(computadora => [
        computadora.responsable,
        computadora.curso,
        computadora.modelo,
        computadora.prestador,
        formatearFechaHora(computadora.fechaHoraEliminacion || computadora.fechaHora),
        tipo
    ]);
    rows.unshift(headers);
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
    XLSX.writeFile(workbook, "Registros_Computadoras.xlsx");
}

// Descargar el archivo Excel con los registros actuales
document.getElementById("downloadExcelBtn").addEventListener("click", function() {
    const computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    registrarEnExcel(computadoras, "Ingreso");
});

// Cargar registros al cargar la página
window.onload = mostrarComputadoras;
