// Array para guardar los registros
let computadorasArray = [];

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
    newInput.placeholder = "Ej: Inspiron 15";
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
        const computadora = { responsable, curso, modelo, prestador, fechaHora, accion: "Ingreso" };
        computadorasArray.push(computadora);
    });

    mostrarComputadoras();

    document.getElementById("computerForm").reset();
    document.getElementById("modelosContainer").innerHTML = '<input type="text" class="modelo" placeholder="Ej: Inspiron 15" required>';
});

// Función para mostrar las computadoras registradas en la tabla
function mostrarComputadoras() {
    const tableBody = document.querySelector("#computerTable tbody");
    tableBody.innerHTML = "";

    computadorasArray.forEach(function(computadora, index) {
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
    });
}

// Función para eliminar una computadora individualmente (visualmente)
function eliminarComputadora(index) {
    // Mantener los datos en el array pero eliminar de la vista
    computadorasArray[index].accion = "Egreso";
    mostrarComputadoras();  // Solo actualiza la vista, no toca el array
}

// Función para eliminar todos los registros de computadoras visualmente
document.getElementById("clearAllBtn").addEventListener("click", function() {
    // Simplemente vacía la tabla, pero no el array
    const tableBody = document.querySelector("#computerTable tbody");
    tableBody.innerHTML = "";
});

// Descargar Excel con datos del array
document.getElementById("downloadExcelBtn").addEventListener("click", function() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(computadorasArray);
    XLSX.utils.book_append_sheet(wb, ws, "RegistrosComputadoras");
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
