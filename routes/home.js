const express= require("express");
const {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento,
}= require("../controlers/homeController");
const urlValidar = require("../middlewares/urlValida");
const verificarUser = require("../middlewares/verificarUser");
const { formPerfil, editarFotoPerfil } = require("../controlers/perfilControler");

const router= express.Router();

router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrl);
router.get("/eliminar/:id", verificarUser, eliminarUrl);
router.get("/editar/:id", verificarUser, editarUrlForm)
router.post("/editar/:id", verificarUser, urlValidar, editarUrl);

router.get("/perfil",verificarUser, formPerfil);
router.post("/perfil", editarFotoPerfil);

router.get("/:shortURL", redireccionamiento)

module.exports = router;