//URL base de la API RESTful 
const url = 'https://crudcrud.com/api/9492690e95db4b5a8ca56724056d9c1f/usuarios'

// Al cargar la página exitosamente, oculta el cuadro de diálogo y obtiene los objetos de la API
window.onload = () => {
    $('#popUp').hide();
    getObjects();
};

//Metodo GET - Obtener datos de un recurso
function loadObjects(){
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url)
        request.responseType = 'json'
        request.onload = () =>{
            if (request.status == 200){
                resolve(request.response)
            } else {
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red ")) 
        request.send()
    })
}

function getObjects() {
    loadObjects()
        .then(response => {
            var tbody = document.querySelector('tbody');
            tbody.innerHTML = '';
            response.forEach(object => {
                insertTr(object);
            });
        })
        .catch(reason => {
            swal("Error","Error al cargar el objeto: " + reason.message);
        });
}

//POST - Crear un nuevo recurso
function addObject() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open('POST', url)
        request.setRequestHeader('Content-type', 'application/json')
        var data = {
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value 
        }; 
        request.onload = () => {
            if(request.status == 200 || request.status == 201){
                resolve(JSON.parse(request.responseText))
            } else {
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red"))
        request.send(JSON.stringify(data)) 
    })
}

function viewObject(object) {
    document.getElementsByName('id2')[0].value = object._id;
    document.getElementsByName('name2')[0].value = object.name;
    document.getElementsByName('lastName2')[0].value = object.lastName;
    document.getElementsByName('email2')[0].value = object.email;
    document.getElementsByName('gender2')[0].value = object.gender;
    $('#popUp').dialog({
        modal: true,
        width: 400,
        height: 350,
        closeText: ''
    }).css('font-size', '15px')
}

function insertTr(object) {
    const tbody = document.querySelector('tbody');
    
    const row = tbody.insertRow();
    row.setAttribute('id', object._id)
    
    const idCell = row.insertCell()
    idCell.innerHTML = object._id;
    
    var nameCell = row.insertCell();
    nameCell.innerHTML = object.name;

    var lastNameCell = row.insertCell();
    lastNameCell.innerHTML = object.lastName;
    
    var emailCell = row.insertCell()
    emailCell.innerHTML = object.email;

    var genderCell = row.insertCell()
    genderCell.innerHTML = object.gender;

    const viewCell = row.insertCell()
    const viewButton = document.createElement('button');
    viewButton.className = 'btn btn-view';
    viewButton.textContent = 'VER';
    viewButton.addEventListener('click',() => viewObject(object));
    viewCell.appendChild(viewButton); 
        
    const delCell = row.insertCell();
    const delButton = document.createElement('button');
    delButton.className = 'btn';
    delButton.textContent = 'BORRAR';
    delButton.addEventListener('click', () => deleteObject(object._id));        
    delCell.appendChild(delButton);
    clearInputs()
}

//Valida los campos de entrada y llama a addObject() para agregar un nuevo objeto.
//Inserta el nuevo objeto en la tabla.
function saveObject() {
    //Si ambos campos tienen valores válidos, continúa con el envío de los datos
    if (
        document.getElementById('name').value.trim() !== '' &&
        document.getElementById('lastName').value.trim() !== '' &&
        document.getElementById('email').value.trim() !== '' &&
        document.getElementById('gender').value.trim() !== ''
    ) {        
            addObject()
                .then((response) => {
                    insertTr(response);  
                    swal("Buen trabajo!", "Usuario agregado satisfactoriamente.", "success");               
                })
                .catch(reason => {
                    swal("Error","Error al guardar el objeto: " + reason.message);
                });
    } else {
        swal("Error", "Por favor, complete todos los campos.", "error");
    }
}

//DELETE - Eliminar un recurso existente
function removeObject(id) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.open("DELETE", `${url}/${id}`)
        request.onload = () => {
            if(request.status == 200 || request.status == 204){
                resolve(request.response)
            }else{
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red "))
        request.send()
        }
    )
}

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
            swal("Error","Error al eliminar el objeto: " + reason.message);
        });
}

//PUT - Actualizar un recurso existente
function modifyObject() {
    return new Promise ((resolve, reject) => {
        const id = document.getElementsByName('id2')[0].value;
        var request = new XMLHttpRequest()
        request.open("PUT", `${url}/${id}`)
        request.setRequestHeader("Content-Type", "application/json")
        
        const data = {
            name: document.getElementsByName('name2')[0].value,
            lastName: document.getElementsByName('lastName2')[0].value,
            email: document.getElementsByName('email2')[0].value,
            gender: document.getElementsByName('gender2')[0].value
        };
        request.onload = () => {
            if(request.status == 200 || request.status == 204){
                resolve({
                    _id: id,
                    ...data
                });
            }else{
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red "))
        request.send(JSON.stringify(data))
    })
}

function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('name').focus();
}

//Llama a modifyObject() para actualizar un objeto y actualiza la tabla.
function updateObject() {
    //Solo permite actualizar si ambos campos tienen datos
    if (document.getElementsByName('name2')[0].value.trim() !== '' &&
        document.getElementsByName('lastName2')[0].value.trim() !== ''&&
        document.getElementsByName('email2')[0].value.trim() !== ''&&
        document.getElementsByName('gender2')[0].value.trim() !== '')
        {        
        modifyObject()
            .then(updatedObject => {
                const row = document.getElementById(updatedObject._id)
                if (row) {
                    row.cells[1].innerText = updatedObject.name;
                    row.cells[2].innerText = updatedObject.lastName;
                    row.cells[3].innerText = updatedObject.email;
                    row.cells[4].innerText = updatedObject.gender;
                }
                $('#popUp').dialog('close');
                clearInputs();
                swal("Usuario actualizado!", "El usuario ha sido actualizado correctamente.", "success");
            })
            .catch(reason => {
                swal("Error","Error al actualizar el objeto: " + reason.message);
            });
        } else {
            swal("Error", "Por favor, complete todos los campos.", "error");
        }
}