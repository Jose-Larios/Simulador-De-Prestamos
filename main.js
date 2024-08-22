//Haciendo el feching de datos
document.addEventListener("DOMContentLoaded", () => {
  const getPrestamos = fetch("./data.json");
  getPrestamos
    .then((res) => res.json())
    .then((res) => {
      tiposPrestamos = res;
      renderPrestamos(tiposPrestamos);
    });
});

//Variable donde se guardaran todos los prestamos hechos
let prestamos = JSON.parse(localStorage.getItem("prestamos")) ?? [];
//Varibable donde se guarda el tipo de prestamo solicitado
let tiposPrestamosGuardados =
  JSON.parse(localStorage.getItem("tiposPrestamos")) ?? [];
//Variable donde se guardaran todos los tipos de prestamos
let tiposPrestamos = [];

//Funcion para calcular prestamo personal
const calcularPrestamo = (cantidad, tiempo, forma, interesAnual) => {
  let tasaInteres = 0;
  if (forma === "Mensuales") {
    tasaInteres = (0.01 * interesAnual) / tiempo;
  } else if (forma === "Quinsenales") {
    tiempo *= 2;
    tasaInteres = (0.01 * interesAnual) / tiempo;
  } else if (forma === "Semanales") {
    tiempo *= 4.345;
    tasaInteres = (0.01 * interesAnual) / tiempo;
  }
  let pagos = (tasaInteres * cantidad) / (1 - (1 + tasaInteres) ** -tiempo);
  return pagos.toFixed(2);
};

//Funcion de transformar numero a moneda
const cambiarMoneda = (numero) => {
  return numero.toLocaleString(`es-Mx`, {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

//Funcion para mostar los tipos de prestamos
const renderPrestamos = (arrayTiposPrestamos) => {
  let containerTiposPrestamos = document.getElementById("tiposPrestamos");
  containerTiposPrestamos.innerHTML = "";
  arrayTiposPrestamos.forEach((elemento, index) => {
    const montoMoneda = cambiarMoneda(elemento.monto);
    let prestamoCard = document.createElement("div");
    prestamoCard.className = "tipPres";
    prestamoCard.innerHTML = `
    <h3 class="elementoTipPres">No. ${elemento.id}</h3>
    <h4 class="elementoTipPres">Prestamo: ${elemento.tipo}</h3>
    <p class="elementoTipPres">Tasa de interes del ${elemento.tasaInteres}%</p>
    <p class="elementoTipPres">Monto maximo ${montoMoneda} MXN</p>
    <button class="elementoTipPres" onclick="solicitarPrestamo(${index})">Solicitar</button>
    `;
    containerTiposPrestamos.appendChild(prestamoCard);
  });
};

//Funcion para mostar formulario
const solicitarPrestamo = (index) => {
  Swal.fire({
    title: "Llena el formulario",
    icon: "info",
    iconColor: "green",
  });
  const elemento = tiposPrestamos[index];
  let formularioPrestamos = document.getElementById("formularioPrestamos");
  formularioPrestamos.innerHTML = "";
  const cantidadMoneda = cambiarMoneda(elemento.monto);
  let formularioCard = document.createElement("div");
  formularioCard.className = "formPres";
  formularioCard.innerHTML = `
    <form onsubmit=subirFormulario(event)>
    <h3 class="elementoFormPres">Usted decidio el prestamo: ${elemento.tipo}</h3>
    <h3 class="elementoFormPres">Con tasa de interes del ${elemento.tasaInteres}%</h3>
    <h3 class="elementoFormPres">Cuanto dinero necesitas, el limite es de ${cantidadMoneda} MXN</h3>
    <input type="number" class="elementoFormPres" oninput=cantidadPrestamo(this.value) required />
    
    <h3 class="elementoFormPres">Que tipo de pago te gustaria</h3>
    <select oninput=formaPago(this.value) class="elementoFormPres" required>
          <option></option>
          <option value="Mensuales">Mensuales</option>
          <option value="Quinsenales">Quinsenales</option>
          <option value="Semanales">Semanales</option>
          </select>
  
          <h3 class="elementoFormPres">A cuantos meses lo pagarias</h3>
          <select oninput=tiempoPago(this.value) class="elementoFormPres" required>
          <option value=""></option>
          <option value="18">18</option>
          <option value="12">12</option>
          <option value="6">6</option>
          </select>
          <button class="elementoFormPres">Calcular monto</button>
    </form>
    `;
  let tipoPrestamoGuardado = {
    id: elemento.id,
    tipo: elemento.tipo,
    tasaInteres: elemento.tasaInteres,
    monto: elemento.monto,
  };
  tiposPrestamosGuardados = tipoPrestamoGuardado;
  localStorage.setItem(
    "tiposPrestamos",
    JSON.stringify(tiposPrestamosGuardados)
  );
  formularioPrestamos.appendChild(formularioCard);
};

//Funcion para mostrar prestamos
const prestamosObtenidos = (arrayPrestamos) => {
  let contenedorPrestamo = document.getElementById("prestamosCalculados");
  contenedorPrestamo.innerHTML = "";

  arrayPrestamos.forEach((elemento) => {
    const cantidadPrestamoMoneda = cambiarMoneda(elemento.cantidadPrestamo);
    const pagosMoneda = cambiarMoneda(elemento.pagosPrestamo);
    let prestamoCard = document.createElement("div");
    prestamoCard.className = "carPres";
    prestamoCard.innerHTML = `
    <h3 class="elementoCarPres">Tipo de prestamo: ${elemento.tipo}</h5>
    <h3 class="elementoCarPres">Numero de prestamo ${elemento.id}</h5>
    <h3 class="elementoCarPres">La cantidad del prestamo es de ${cantidadPrestamoMoneda} MXN</h2>
    <h3 class="elementoCarPres">La forma de pago es ${elemento.formaPrestamo}</h2>
    <h3 class="elementoCarPres">El tiempo del pago es de ${elemento.tiempoPrestamo} meses</h2>
    <h3 class="elementoCarPres">Tus pagos ${elemento.formaPrestamo} serian de ${pagosMoneda} MXN</h2>
    <button onclick="eliminarPrestamo(${elemento.id})" class="elementoCarPres" >Eliminar</button>
    <button onclick="pedirPrestamo()" class="elementoCarPres" >Pedir</button>
    `;
    contenedorPrestamo.appendChild(prestamoCard);
  });
};

// //Funcion para eliminar prestamo
const eliminarPrestamo = (id) => {
  Swal.fire({
    title: "Seguro quieres eliminar el prestamo calculado",
    showDenyButton: true,
    confirmButtonText: "Si, eliminar",
    denyButtonText: "No, no eliminar",
  }).then((res) => {
    if (res.isConfirmed) {
      prestamos = prestamos.filter((elemento) => elemento.id !== id);
      localStorage.setItem("prestamos", JSON.stringify(prestamos));
      prestamosObtenidos(prestamos);
      Swal.fire({
        title: "Eliminado",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    } else if (res.isDenied) {
      Swal.fire({
        title: "El prestamo calculado no se elimino",
        icon: "info",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

//Funcion para pedir prestamo
const pedirPrestamo = () => {
  Swal.fire({
    title: `El prestamo se esta valorando recibiras una notificacion en 24 hrs`,
    icon: "info",
  });
};

//Mostrando prestamos guardados
prestamosObtenidos(prestamos);

// Recuperando el valor de la cantidad
let cantidad = 0;
const cantidadPrestamo = (event) => {
  cantidad = event;
};

//Recuperando el valor de la forma de los pagos
let forma = "";
const formaPago = (event) => {
  forma = event;
};

// //Recuperando el valor del tiempo a pagar
let tiempo = 0;
const tiempoPago = (event) => {
  tiempo = event;
};

//Recuperando cuado se envia el formulario
let contador = 0;
const subirFormulario = (evento) => {
  evento.preventDefault();
  contador++;
  if (cantidad <= 0) {
    Swal.fire({
      title: "No se aceptan numeros menores de 0",
      icon: "error",
    });
  } else if (cantidad > tiposPrestamosGuardados.monto) {
    const montoMaximoMoneda = cambiarMoneda(tiposPrestamosGuardados.monto);
    Swal.fire({
      title: `El monto maximo de prestamo es de ${montoMaximoMoneda} MXN`,
      icon: "warning",
    });
  } else {
    Swal.fire({
      icon: "success",
      title: "Prestamo calculado",
      showConfirmButton: false,
      timer: 1500,
    });
    let prestamoCalculado = calcularPrestamo(
      cantidad,
      tiempo,
      forma,
      tiposPrestamosGuardados.tasaInteres
    );
    let prestamo = {
      id: contador,
      tipo: tiposPrestamosGuardados.tipo,
      cantidadPrestamo: Number(cantidad),
      formaPrestamo: forma,
      tiempoPrestamo: Number(tiempo),
      pagosPrestamo: Number(prestamoCalculado),
    };
    prestamos.push(prestamo);
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    prestamosObtenidos(prestamos);
  }
};
