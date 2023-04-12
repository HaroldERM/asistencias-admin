import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Table, Modal, Form, Button, Pagination } from "react-bootstrap";
import { db } from "../config/firebase/firebase";
import { v4 as uuid } from "uuid";
//librería de mensajes información
import { toast, ToastContainer } from "react-toastify";
//librería de iconos boostrap para react
import { FaUserTimes } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";

function Profesores() {
  const [profesores, setProfesores] = useState([]);

  const [dataForm, setDataForm] = useState({
    id: "",
    nombre: "",
    email: "",
    password: "",
  });
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [profesorAEliminar, setProfesorAELiminar] = useState("");
  const [resultados, setResultados] = useState([]);
  const [valorSeleccionado, setValorSeleccionado] = useState("");
  const { id, nombre, email, password } = dataForm;
  const handleChange = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.id]: e.target.value,
    });
  };

  const handleDeleteClick = (id) => {
    setProfesorAELiminar(id);
    setShowModalEliminar(true);
  };

  const handleConfirmClick = () => {
    // Lógica para eliminar el elemento
    eliminarProfesor(profesorAEliminar);
    setShowModalEliminar(false);
  };

  useEffect(() => {
    const obtenerProfesores = async () => {
      const profesoresCollection = collection(db, "profesores");
      const snapshot = await getDocs(profesoresCollection);
      const listaProfesores = snapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      setProfesores(listaProfesores);
    };
    obtenerProfesores();
  }, []);

  const abrirModal = (accion, id = "") => {
    if (accion === "agregar") {
      setModalTitle("Agregar profesor");
      setModalAction("Agregar");
      setDataForm({
        id: "",
        nombre: "",
        email: "",
        password: "",
      });
    } else if (accion === "editar") {
      const profesor = profesores.find((profesor) => profesor.id === id);
      setModalTitle("Editar profesor");
      setModalAction("Guardar cambios");
      setDataForm({
        id: profesor.id,
        nombre: profesor.nombre,
        email: profesor.email,
        password: profesor.password,
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
  };
  function buscarProfesor(email) {
    // console.log(email)
    for (let i = 0; i < profesores.length; i++) {
      if (profesores[i].email === email) {
        return profesores[i];
      }
      return null;
    }
  }
  const agregarProfesor = async (e) => {
    e.preventDefault();
    const nuevoProfesor = { id: uuid(), nombre, email, password };

    if (buscarProfesor(email) === null || profesores.length === 0) {
      await addDoc(collection(db, "profesores"), nuevoProfesor);
      setProfesores([...profesores, nuevoProfesor]);
      toast.success("Profesor agregado exitosamente.");
      cerrarModal();
    } else if (buscarProfesor(email) !== null) {
      toast.error("El email a registrar ya existe");
    }
  };

  const editarProfesor = async (e) => {
    e.preventDefault();
    const profesorActualizado = { nombre, email, password };
    const q = query(collection(db, "profesores"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, profesorActualizado)
        .then(() => {
          toast.success("Profesor editado exitosamente.");
        })
        .catch((error) => {
          toast.error("Ha ocurrido un error.");
        });
    });
    const listaProfesoresActualizada = profesores.map((profesor) =>
      profesor.id === id ? { id: id, ...profesorActualizado } : profesor
    );
    setProfesores(listaProfesoresActualizada);
    cerrarModal();
  };

  const eliminarProfesor = async (id) => {
    const q = query(collection(db, "profesores"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
        .then(() => {
          toast.success("Profesor eliminado exitosamente.");
        })
        .catch((error) => {
          toast.error("Ha ocurrido un error.");
        });
    });
    const listaProfesoresActualizada = profesores.filter(
      (profesor) => profesor.id !== id
    );
    setProfesores(listaProfesoresActualizada);
  };

  //Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages =
    resultados.length > 0
      ? Math.ceil(resultados.length / itemsPerPage)
      : Math.ceil(profesores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems =
    resultados.length > 0
      ? resultados.slice(startIndex, endIndex)
      : profesores.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const buscarEnLista = (terminoBusqueda) => {
    const resultadosBusq = [];
    if (
      valorSeleccionado === "default" ||
      valorSeleccionado === "nombre" ||
      valorSeleccionado === ""
    ) {
      for (let i = 0; i < profesores.length; i++) {
        if (
          profesores[i].nombre.toLowerCase() === terminoBusqueda.toLowerCase()
        ) {
          resultadosBusq.push(profesores[i]);
        }
      }
    }
    if (valorSeleccionado === "correo") {
      for (let i = 0; i < profesores.length; i++) {
        if (profesores[i].email === terminoBusqueda) {
          console.log(terminoBusqueda);
          resultadosBusq.push(profesores[i]);
        }
      }
    }
    setResultados(resultadosBusq);
  };
  const handleBusqueda = (event) => {
    const terminoBusqueda = event.target.value;
    buscarEnLista(terminoBusqueda);
  };

  function handleSelectChange(event) {
    setValorSeleccionado(event.target.value);
  }
  return (
    <div className="container-lg ">
      <h1>Profesores</h1>
      <div className="row">
        <div className="col">
          <Button
            className="px-2 py-1 mb-2 fs-5"
            variant="primary"
            onClick={() => abrirModal("agregar")}
          >
            <FaUserPlus />
          </Button>
        </div>
        <div className="col">
          <div className="row">
            <div className="col">
              <Form.Select
                aria-label="Default select example"
                onChange={handleSelectChange}
              >
                <option value="default">Filtros</option>
                <option value="nombre">Por nombre</option>
                <option value="correo">Por correo</option>
              </Form.Select>
            </div>
            <div className="col">
              <Form className="d-sm-flex">
                <Form.Control
                  type="search"
                  placeholder="Buscar"
                  className="me-2"
                  aria-label="Search"
                  onChange={handleBusqueda}
                />
                {/* <Button
                  variant="outline-success"
                  onClick={() => buscarEnLista()}
                >
                  Buscar
                </Button> */}
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Table striped bordered hover>
        <thead className="table-dark table-bg-scale-50">
          <tr>
            <th>Nombre completo</th>
            <th>E-mail</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((profesor) => (
            <tr key={profesor.id}>
              <td>{profesor.nombre}</td>
              <td>{profesor.email}</td>
              <td>
                <Button
                  className="px-2 py-1 mx-1 fs-5"
                  variant="warning"
                  onClick={() => abrirModal("editar", profesor.id)}
                >
                  <FaUserEdit />
                </Button>
                <Button
                  className="px-2 py-1 mx-1 fs-5"
                  variant="danger"
                  onClick={() => handleDeleteClick(profesor.id)}
                >
                  <FaUserTimes />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </Pagination>

      <Modal
        show={showModalEliminar}
        onHide={() => setShowModalEliminar(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar este profesor?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalEliminar(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmClick}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="form1" onSubmit={id ? editarProfesor : agregarProfesor}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Escribe el nombre completo del profesor"
                value={nombre}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="Escribe el e-mail del profesor"
                value={email}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Escribe la contraseña del profesor"
                value={password}
                onChange={handleChange}
                required={!id}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button form="form1" variant="primary" type="submit">
            {modalAction}
          </Button>{" "}
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>{" "}
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default Profesores;
