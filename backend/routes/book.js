const express = require('express')
const router = express.Router ()
const stuffCtrl = require('../controllers/book')
const { uploadImage, compressImage } = require("../middleware/multer-config");

const auth = require ('../middleware/auth')

// Listes des livres
router.get('/',   stuffCtrl.BibliothequeThing)
//livre en detail 
router.get('/:id',  stuffCtrl.IdThing)
//Création d'un livre 
router.post ('/', auth,  uploadImage, compressImage,  stuffCtrl.createThing)
// Modification d'un livre 
router.put('/:id', auth, uploadImage, compressImage,   stuffCtrl.modifyThing)
// Supprimer un livre 
router.delete('/:id', auth,  stuffCtrl.deleteThing)  
// Noter un livre 
router.post ('/:id/rating', stuffCtrl.rateThing)


  module.exports = router