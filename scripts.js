//URL base de la API RESTful 
const url = 'https://api.restful-api.dev/objects'
let currentId = 1;
// Al cargar la página exitosamente, oculta el cuadro de diálogo y obtiene los objetos de la API
window.onload = () => {
    $('#popUp').hide();
    getObjects();
};

function httpRequest(method, url, data = null) {
    return new Promise((resolve, reject) =>{
        const request = new XMLHttpRequest();       
        request.open(method, url);       
        request.setRequestHeader('Content-Type', 'application/json'); // Establece el encabezado para enviar datos JSON

        request.onload = () => {
            if (request.status == 200){
                resolve(JSON.parse(request.responseText));// Si la solicitud es exitosa, resuelve la promesa con la respuesta
            } else {
                reject(Error(request.statusText)) // Si hay un error HTTP, rechaza la promesa con el mensaje de error
            }
        };

        request.onerror = () => {
            reject(Error('Error: unexpected network error')); // Si ocurre un error de red, rechaza la promesa
        };

        request.send(data ? JSON.stringify(data): null); // Envía los datos (si los hay) como JSON
    });
}

//PROMESAS//

//Realiza una solicitud GET a la API para obtener datos.
function loadObjects() {
    return httpRequest('GET', url);
}

//Realiza una solicitud POST para agregar un nuevo objeto.
function addObject() {
    const data = {
        id: currentId++,
        name: document.getElementById('name').value,
        data: {
            email: document.getElementById('email').value
        }
    };
    // Verifica que el objeto sea válido antes de enviarlo
    return httpRequest('POST', url, data); // Envía el objeto serializado
}

//Realiza una solicitud DELETE para eliminar un objeto por su id.
function removeObject(id) {
    return httpRequest('DELETE', `${url}/${id}`);
}

//Realiza una solicitud PUT para actualizar un objeto existente.
function modifyObject() {
    const id = document.getElementsByName('id2')[0].value;
    const data = {
        name: document.getElementsByName('name2')[0].value,
        data: {
            email: document.getElementsByName('email2')[0].value
        }
    };
    return httpRequest('PUT', `${url}/${id}`, data);
}

//FUNCIONES QUE CONSUMEN LAS PROMESAS//

//Llama a loadObjects() para obtener los datos.
//Itera sobre los objetos de la respuesta y los inserta en la tabla usando insertTr().
function getObjects() {
    loadObjects()
        .then(response => {
            var tbody = document.querySelector('tbody');
            tbody.innerHTML = '';
            response.forEach(object => {
            if (object.data && object.data.email) {
                insertTr(object, true);
                if (object.id > currentId) {
                    currentId = object.id;
                }
            }
        });
    })
    .catch(reason => {
        console.error(reason)
    });
}

//Valida los campos de entrada y llama a addObject() para agregar un nuevo objeto.
//Inserta el nuevo objeto en la tabla.
function saveObject() {
    //Si ambos campos tienen valores válidos, continúa con el envío de los datos
    if (document.getElementById('name').value.trim() !== '' &&
        document.getElementById('email').value.trim() !== '') {
        
            addObject()
                .then((response) => {
                    console.log(response);
                    insertTr(response, true);                 
                })
                .catch(reason => {
                console.error('Error al agregar el objeto:' ,reason);
                alert('Error: '+ reason.message);
                });
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

//Llama a removeObject() para eliminar un objeto y actualiza la tabla.
function deleteObject(id) {
    removeObject(id)
        .then(() => {
            const row = document.getElementById(id);
            if (row) row.remove();
            clearInputs();
        })
        .catch(reason => {
            console.error(reason);
            alert('Error al eliminar el objeto: ' + reason.message);
        });
}

//Llama a modifyObject() para actualizar un objeto y actualiza la tabla.
function updateObject() {
    if (document.getElementsByName('name2')[0].value.trim() !== '' &&
        document.getElementsByName('email2')[0].value.trim() !== '') {
        
        modifyObject()
            .then(updatedObject => {
            const row = document.getElementById(updatedObject.id)
            if (row) {
                row.cells[1].innerText = updatedObject.name;
                row.cells[2].innerText = updatedObject.data.email;
            }
            $('#popUp').dialog('close');
            clearInputs();
        })
        .catch(reason => {
            console.error('Error al actualizar el objeto:', reason);
            alert('Error al actualizar el objeto: ' + reason.message);
        });
    } else {
        alert('Por favor, complete todos los campos.');
    }
}

//FUNCIONES DE AGREGADO//

function insertTr(object, canChange) {
    const tbody = document.querySelector('tbody');
    const row = tbody.insertRow();
    row.setAttribute('id', object.id)
    
    const idCell = row.insertCell()
    idCell.innerHTML = object.id
    
    var nameCell = row.insertCell();
    nameCell.innerHTML = object.name;
    
    var emailCell = row.insertCell()
    emailCell.innerHTML = object.data.email;
    
    if (canChange) {
        const viewCell = row.insertCell()
        viewCell.innerHTML = `<button onclick='viewObject(${JSON.stringify(object)})'>VIEW</button>`
        const delCell = row.insertCell()
        delCell.innerHTML = `<button onclick='deleteObject(${object.id})'>DELETE</button>`
    }
    clearInputs()
}

function viewObject(object) {
    document.getElementsByName('id2')[0].value = object.id;
    document.getElementsByName('name2')[0].value = object.name;
    document.getElementsByName('email2')[0].value = object.data.email;

    $('#popUp').dialog({
        closeText: ''
    }).css('font-size', '15px')
}

function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('name').focus();
}