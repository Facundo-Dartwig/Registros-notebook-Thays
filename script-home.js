// Array para guardar los registros, se recupera desde el localStorage para persistencia
let computadorasArray = JSON.parse(localStorage.getItem("computadorasArray")) || [];

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

// Registrar varias computadoras con diferentes modelos
document.getElementById("computerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const responsable = document.getElementById("responsable").value;
    const curso = document.getElementById("curso").value;
    const prestador = document.getElementById("prestador").value;
    const fechaHora = document.getElementById("fechaHora").value;

    const modelos = Array.from(document.querySelectorAll(".modelo")).map(input => input.value);

    modelos.forEach(modelo => {
        const computadora = { responsable, curso, modelo, prestador, fechaHora, accion: "Egreso" };
        computadorasArray.push(computadora);
    });

    // Guardar en localStorage para persistencia
    localStorage.setItem("computadorasArray", JSON.stringify(computadorasArray));

    mostrarComputadoras();

    // Resetear formulario
    document.getElementById("computerForm").reset();
    document.getElementById("modelosContainer").innerHTML = '<input type="text" class="modelo" placeholder="Ej: Inspiron 15" required>';
});

// Función para mostrar las computadoras registradas en la tabla
function mostrarComputadoras() {
    const tableBody = document.querySelector("#computerTable tbody");
    tableBody.innerHTML = "";

    computadorasArray.forEach(function(computadora, index) {
        if (computadora.accion !== "Ingreso") { 
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
            deleteBtn.className = "delete-btn";
            deleteBtn.addEventListener("click", function() {
                eliminarComputadora(index);
            });

            accionesCell.appendChild(deleteBtn);
            row.appendChild(responsableCell);
            row.appendChild(cursoCell);
            row.appendChild(modeloCell);
            row.appendChild(prestadorCell);
            row.appendChild(fechaHoraCell);
            row.appendChild(accionesCell);

            tableBody.appendChild(row);
        }
    });
}

// Función para eliminar una computadora individualmente (visualmente)
function eliminarComputadora(index) {
    const fechaEgreso = new Date().toISOString();
    computadorasArray[index].accion = "Ingreso";
    computadorasArray[index].fechaHoraEgreso = fechaEgreso;

    // Guardar en localStorage
    localStorage.setItem("computadorasArray", JSON.stringify(computadorasArray));

    // Mostrar solo los ingresos en la tabla
    mostrarComputadoras();
}

// Botón para eliminar todos los registros
document.getElementById("clearAllBtn").addEventListener("click", clearAllComputers);

function clearAllComputers() {
    const fechaEgreso = new Date().toISOString(); // Fecha y hora del egreso
    computadorasArray.forEach((computadora, index) => {
        computadorasArray[index].accion = "Ingreso";  // Cambiar a "Ingreso" para marcar en el Excel
        computadorasArray[index].fechaHoraEgreso = fechaEgreso;  // Registrar la fecha de egreso
    });

    // Guardar el array actualizado en localStorage
    localStorage.setItem("computadorasArray", JSON.stringify(computadorasArray));

    // Limpiar visualmente la tabla
    document.querySelector("#computerTable tbody").innerHTML = '';

    mostrarComputadoras();
    // Aquí no eliminamos del array, solo limpiamos la visualización
}

// Descargar Excel con datos del array
document.getElementById("downloadExcelBtn").addEventListener("click", function() {
    const wb = XLSX.utils.book_new();

    // Convertir el array a un formato adecuado para el Excel
    const data = computadorasArray.map(computadora => ({
        Responsable: computadora.responsable,
        Curso: computadora.curso,
        Modelo: computadora.modelo,
        Prestador: computadora.prestador,
        FechaHoraIngreso: computadora.fechaHora ? formatearFechaHora(computadora.fechaHora) : '',
        FechaHoraEgreso: computadora.fechaHoraEgreso ? formatearFechaHora(computadora.fechaHoraEgreso) : '',
        Accion: computadora.accion,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "RegistrosComputadoras");

    // Descargar el archivo
    XLSX.writeFile(wb, "registros_computadoras.xlsx");
});

// Formatear fecha/hora en formato latinoamericano
function formatearFechaHora(fechaHoraISO) {
    const fecha = new Date(fechaHoraISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos} hs`;
}

// Mostrar las computadoras al cargar la página
mostrarComputadoras();
