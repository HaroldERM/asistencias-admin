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

function Cursos() {
  const [Cursos, setCursos] = useState([].sort());
  const [dataForm, setDataForm] = useState({
    id: "",
    nombre: "",
    carrera: "",
    codigo: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [show, setShow] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [cursoEliminar, setCursoEliminar] = useState("");
  const [busqueda, setBusqueda]= useState("");


  const { id, nombre, carrera, codigo } = dataForm;
  const handleChange = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => {
    const obtenerCursos = async () => {
      const CursosCollection = collection(db, "cursos");
      const snapshot = await getDocs(CursosCollection);
      const listaCursos = snapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      setCursos(listaCursos);
    };
    obtenerCursos();
  }, []);

  const abrirModal = (accion, id = "") => {
    if (accion === "agregar") {
      setModalTitle("Agregar curso");
      setModalAction("Agregar");
      setDataForm({
        id: "",
        nombre: "",
        carrera: "",
        codigo: "",
      });
    } else if (accion === "editar") {
      const curso = Cursos.find((curso) => curso.id === id);
      setModalTitle("Editar curso");
      setModalAction("Guardar cambios");
      setDataForm({
        id: curso.id,
        nombre: curso.nombre,
        carrera: curso.carrera,
        codigo: curso.codigo,
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
  };
  function buscarcurso(codigo) {
    for (let i = 0; i < Cursos.length; i++) {
      if (Cursos[i].codigo === codigo) {
        return Cursos[i];
      }
      return null;
    }
  }

  const agregarcurso = async (e) => {
    e.preventDefault();
    const nuevocurso = { id: uuid(), nombre, carrera, codigo };

    if (buscarcurso(codigo) === null || Cursos.length === 0) {
      await addDoc(collection(db, "cursos"), nuevocurso);
      setCursos([...Cursos, nuevocurso]);
      toast.success("Curso agregado exitosamente.");
      cerrarModal();
    } else if (buscarcurso(codigo) !== null ) {
      console.log(buscarcurso(codigo));
      toast.error("El codigo a registrar ya existe");
    }
  };

  const editarcurso = async (e) => {
    e.preventDefault();
    const cursoActualizado = { nombre, carrera, codigo };
    const q = query(collection(db, "cursos"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, cursoActualizado)
        .then(() => {
          toast.success("Curso editado exitosamente.");
        })
        .catch((error) => {
          toast.error("Ha ocurrido un error.");
        });
    });
    const listaCursosActualizada = Cursos.map((curso) =>
      curso.id === id ? { id: id, ...cursoActualizado } : curso
    );
    setCursos(listaCursosActualizada);
    cerrarModal();
  };

  
  const handleShow = (id) => {
    setCursoEliminar(id);
    setShow(true);
  }

  const handleConfirmar = () => {
    eliminarcurso(cursoEliminar);
    setShow(false);
  }

  const eliminarcurso = async (id) => {
    const q = query(collection(db, "cursos"), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
        .then(() => {
          toast.success("curso eliminado exitosamente.");
        })
        .catch((error) => {
          toast.error("Ha ocurrido un error.");
        });
    });
    const listaCursosActualizada = Cursos.filter(
      (curso) => curso.id !== id
    );
    setCursos(listaCursosActualizada);
  };

  //Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(Cursos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = Cursos.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBusqueda=e=>{
    setBusqueda(e.target.value);
    filtrar(e.target.value);
  }
  
  const filtrar=(terminoBusqueda)=>{
    var resultadosBusqueda=Cursos.filter((elemento)=>{
      if(elemento.nombre.toString().toLowerCase().includes(terminoBusqueda.toLowerCase())
      || elemento.codigo.toString().toLowerCase().includes(terminoBusqueda.toLowerCase())
      ){
        return elemento;
      }
    });
    setCursos(resultadosBusqueda);
  }

  return (
    <div className="container-lg ">
      <h1>Cursos</h1>
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
              <Form.Select aria-label="Default select example">
                <option>Filtros</option>
                <option value="Nombre">Nombre</option>
                <option value="Carrera">Carrera</option>
                <option value="Codigo">Codigo</option>
              </Form.Select>
            </div>
            <div className="col">
              <Form className="d-sm-flex">
                <input
                  className="form-control inputBuscar"
                  value={busqueda}
                  placeholder="Búsqueda por Nombre o Codigo"
                  onChange={handleBusqueda}
                />
                <Button variant="outline-success">Buscar</Button>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Table striped bordered hover>
        <thead className="table-dark table-bg-scale-50">
          <tr>
            <th>Nombre</th>
            <th>Carrera</th>
            <th>Codigo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((curso) => (
            <tr key={curso.id}>
              <td>{curso.nombre}</td>
              <td>{curso.carrera}</td>
              <td>{curso.codigo}</td>
              <td>
                <Button
                  className="px-2 py-1 mx-1 fs-5"
                  variant="warning"
                  onClick={() => abrirModal("editar", curso.id)}
                >
                  <FaUserEdit />
                </Button>
                <Button
                  className="px-2 py-1 mx-1 fs-5"
                  variant="danger"
                  onClick={() => handleShow(curso.id)}
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

      <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar elemento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro de que quieres eliminar este elemento?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirmar}>
                    Eliminar
                </Button>
            </Modal.Footer>
        </Modal>

      <Modal show={showModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="form1" onSubmit={id ? editarcurso : agregarcurso}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Escribe el nombre del curso"
                value={nombre}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="carrera">
              <Form.Label>Carrera</Form.Label>
              <Form.Control
                type="carrera"
                placeholder="Escribe la carrera del curso"
                value={carrera}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="codigo">
              <Form.Label>Codigo</Form.Label>
              <Form.Control
                type="codigo"
                placeholder="Escribe el codigo del curso"
                value={codigo}
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

export default Cursos;
