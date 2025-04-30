//URL base de la API RESTful 
const url = 'https://api.restful-api.dev/objects'

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
        name: document.getElementById('name').value,
        data: {
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value
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
            lastName: document.getElementsByName('lastName2')[0].value,
            email: document.getElementsByName('email2')[0].value,
            gender: document.getElementsByName('gender2')[0].value
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
                    insertTr(response, true);  
                    swal("Buen trabajo!", "Usuario agregado satisfactoriamente.", "success");               
                })
                .catch(reason => {
                alert('Error: '+ reason.message);
                });
    } else {
        swal("Error", "Por favor, complete todos los campos.", "error");
    }
}

//Llama a removeObject() para eliminar un objeto y actualiza la tabla.
function deleteObject(id) {
    removeObject(id)
        .then(() => {
            const rows = document.querySelectorAll('tr')
            rows.forEach(row => {
                if (row.getAttribute('id') === id.toString()) {
                    row.remove();
                    swal("Usuario eliminado!", "El usuario ha sido eliminado correctamente.", "success");
                    clearInputs()
                }
            })
        })
        .catch(reason => {
            alert('Error al eliminar el objeto: ' + reason.message);
        });
}

//Llama a modifyObject() para actualizar un objeto y actualiza la tabla.
function updateObject() {
    //Solo permite actualizar si ambos campos tienen datos
    if (document.getElementsByName('name2')[0].value.trim() !== '' &&
        document.getElementsByName('lastName2')[0].value.trim() !== ''&&
        document.getElementsByName('email2')[0].value.trim() !== ''&&
        document.getElementsByName('gender2')[0].value.trim() !== ''
                                                                        )
        {
        
        modifyObject()
            .then(updatedObject => {
            const row = document.getElementById(updatedObject.id)
            if (row) {
                row.cells[1].innerText = updatedObject.name;
                row.cells[2].innerText = updatedObject.data.lastName;
                row.cells[3].innerText = updatedObject.data.email;
                row.cells[4].innerText = updatedObject.data.gender;
            }
            $('#popUp').dialog('close');
            clearInputs();

            swal("Usuario actualizado!", "El usuario ha sido actualizado correctamente.", "success");
        })
        .catch(reason => {
            alert('Error al actualizar el objeto: ' + reason.message);
        });
    } else {
        swal("Error", "Por favor, complete todos los campos.", "error");
    }
}

//FUNCIONES DE AGREGADO//

function insertTr(object, canChange) {
    const tbody = document.querySelector('tbody');
    const row = tbody.insertRow();
    row.setAttribute('id', object.id)
    
    const idCell = row.insertCell()
    idCell.innerHTML = object.id;
    
    var nameCell = row.insertCell();
    nameCell.innerHTML = object.name;

    var lastNameCell = row.insertCell();
    lastNameCell.innerHTML = object.data.lastName;
    
    var emailCell = row.insertCell()
    emailCell.innerHTML = object.data.email;

    var genderCell = row.insertCell()
    genderCell.innerHTML = object.data.gender;

    
    if (canChange) {
        const viewCell = row.insertCell()
        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-view';
        viewButton.textContent = 'VIEW';
        viewButton.addEventListener('click',() => viewObject(object));

        viewCell.appendChild(viewButton); 
        
        const delCell = row.insertCell();
        const delButton = document.createElement('button');
        delButton.className = 'btn';
        delButton.textContent = 'DELETE';
        delButton.addEventListener('click', () => deleteObject(object.id));
        
        delCell.appendChild(delButton);
    }
    clearInputs()
}

function viewObject(object) {
    document.getElementsByName('id2')[0].value = object.id;
    document.getElementsByName('name2')[0].value = object.name;
    document.getElementsByName('lastName2')[0].value = object.data.lastName;
    document.getElementsByName('email2')[0].value = object.data.email;
    document.getElementsByName('gender2')[0].value = object.data.gender;

    $('#popUp').dialog({
        closeText: ''
    }).css('font-size', '15px')
}

function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('name').focus();
}