//URL base de la API RESTful (endpoint de CRUD CRUD )
const url = 'https://crudcrud.com/api/32f77cb20f6e4d328835420c636a4cd5/usuarios'

//Cuando la pagina carga, oculta el popup de edicion y carga los usuarios
window.onload = () => {
    $('#popUp').hide();
    getObjects();
};

//Metodo GET - Trae todos los usuarios desde la API
function loadObjects(){
    return new Promise((resolve, reject) => { //Objeto que representa una tarea asíncrona y permite manejar el resultado cuando esté listo.
        const request = new XMLHttpRequest(); //XMLHttpRequest es un objeto de JavaScript que permite hacer solicitudes HTTP (GET, POST, PUT, DELETE, etc.) a servidores web sin recargar la página.
        request.open('GET', url) //Prepara la peticion GET
        request.responseType = 'json' //Espera respuesta en formato JSON
        request.onload = () =>{
            if (request.status == 200){ //Codigo de respuesta HTTP que significa "OK"
                resolve(request.response) //Resuelve la promesa con los datos recibidos
            } else {
                reject(Error(request.statusText)) //Si hay error, rechaza la promesa con el error
            }
        }
        request.onerror = () => reject(Error("Error de red ")) //Si hay error de red, rechaza la promesa 
        request.send() //Envia la peticion 
    })
}

//Llamaa a loadObjects(), limpia la tabla y agrega cada usuario a la tabla
function getObjects() {
    loadObjects()
        .then(response => {
            var tbody = document.querySelector('tbody'); //Selecciona el cuerpo de la tabla
            tbody.innerHTML = ''; //Limpia la tabla
            response.forEach(object => {
                insertTr(object); //Inserta cada usuario como una fila
            });
        })
        .catch(reason => {
            swal("Error","Error al cargar el objeto: " + reason.message); //Muestra error si falla al GET
        });
}

//POST - Crear un nuevo usuario a la API
function addObject() {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open('POST', url)
        request.setRequestHeader('Content-type', 'application/json') //Indica que se envia JSON
        var data = {
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value 
        }; 
        request.onload = () => {
            if(request.status == 200 || request.status == 201){ //201 - Recurso creado exitosamente 
                resolve(JSON.parse(request.responseText))
            } else {
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red"))
        request.send(JSON.stringify(data)) //Envia los datos como JSON
    })
}

//Muestra el popup de edicion con los datos del usuario seleccionado
function viewObject(object) {
    //Llena los campos del popup con los datos del usuario
    document.getElementsByName('id2')[0].value = object._id;
    document.getElementsByName('name2')[0].value = object.name;
    document.getElementsByName('lastName2')[0].value = object.lastName;
    document.getElementsByName('email2')[0].value = object.email;
    document.getElementsByName('gender2')[0].value = object.gender;
    //Abre el popup modal
    $('#popUp').dialog({
        modal: true,
        width: 400,
        height: 350,
        closeText: ''
    }).css('font-size', '15px')
}

//Inserta una fila en la tabla con los datos del usuario
function insertTr(object) {
    const tbody = document.querySelector('tbody');
    
    const row = tbody.insertRow();//Crea una nueva fila
    row.setAttribute('id', object._id)//Usa el _id como identificador de la fila
    
    //Crea y llena cada celda con los datos del usuario
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

    //Boton VER para editar el usuario
    const viewCell = row.insertCell()
    const viewButton = document.createElement('button');
    viewButton.className = 'btn btn-view';
    viewButton.textContent = 'VER';
    viewButton.addEventListener('click',() => viewObject(object));
    viewCell.appendChild(viewButton); 
    
    //Boton BORRAR para eliminar el usuario
    const delCell = row.insertCell();
    const delButton = document.createElement('button');
    delButton.className = 'btn';
    delButton.textContent = 'BORRAR';
    delButton.addEventListener('click', () => deleteObject(object._id));        
    delCell.appendChild(delButton);
    clearInputs() //Limpia los campos del formulario principal
}

//Valida los campos y llama a addObject() para agregar un nuevo objeto.
function saveObject() {
    //Si todos los campos tienen valores válidos, continúa
    if (
        document.getElementById('name').value.trim() !== '' &&
        document.getElementById('lastName').value.trim() !== '' &&
        document.getElementById('email').value.trim() !== '' &&
        document.getElementById('gender').value.trim() !== ''
    ) {        
        addObject()
            .then((response) => { //Se ejecuta cuando se resuelve correctamente la promesa(resolve)
                insertTr(response); //Agrega el nuevo usuario a la tabla  
                swal("Buen trabajo!", "Usuario agregado satisfactoriamente.", "success");               
            })
            .catch(reason => { //Se ejecuta cuando la promesa es rechazada (reject o onerror)
                swal("Error","Error al guardar el objeto: " + reason.message);
            });
    } else {
        swal("Error", "Por favor, complete todos los campos.", "error");
    }
}

//DELETE - Eliminar un usuario de la API
function removeObject(id) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.open("DELETE", `${url}/${id}`) //Prepara la peticion DELETE y crea el enlace entre codigo y URL
        request.onload = () => {
            if(request.status == 200 || request.status == 204){//204: Exitosa pero no devuelve ningun contenido en la respuesta
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
//Llama a removeObject() y elimina la fila de la tabla si la API responde "OK"
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

//PUT - Actualizar un usuario existente en la API
function modifyObject() {
    return new Promise ((resolve, reject) => {
        // Obtiene el id y los datos del usuario desde el popup de edición
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
                    /*
                    Equivalente a: 
                        _id: id,
                        name: data.name,
                        lastName: data.lastName,
                        email: data.email,
                        gender: data.gender
                    */
                });
            }else{
                reject(Error(request.statusText))
            }
        }
        request.onerror = () => reject(Error("Error de red "))
        request.send(JSON.stringify(data))
    })
}

//Limpia los campos del formulario principal
function clearInputs() {
    document.getElementById('name').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('name').focus();
}

//Llama a modifyObject() para actualizar un usuario y actualiza la tabla.
function updateObject() {
    //Solo permite actualizar si todos los campos tienen datos
    if (document.getElementsByName('name2')[0].value.trim() !== '' &&
        document.getElementsByName('lastName2')[0].value.trim() !== ''&&
        document.getElementsByName('email2')[0].value.trim() !== ''&&
        document.getElementsByName('gender2')[0].value.trim() !== '')
        {        
        modifyObject()
            .then(updatedObject => {
                //Busca la fila correspondiente y actualiza sus celdas
                const row = document.getElementById(updatedObject._id)
                if (row) {
                    row.cells[1].innerText = updatedObject.name;
                    row.cells[2].innerText = updatedObject.lastName;
                    row.cells[3].innerText = updatedObject.email;
                    row.cells[4].innerText = updatedObject.gender;
                }
                $('#popUp').dialog('close');//Cierra el popup
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