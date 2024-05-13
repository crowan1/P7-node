const express = require('express')
const router = express.Router ()
const stuffCtrl = require('../controllers/book')
const { uploadImage, compressImage } = require("../middleware/multer-config");

const auth = require ('../middleware/auth')


router.get('/',   stuffCtrl.BibliothequeThing)
router.get('/:id',  stuffCtrl.IdThing)
router.post ('/', auth,  uploadImage, compressImage,  stuffCtrl.createThing)
router.put('/:id', auth, uploadImage, compressImage,   stuffCtrl.modifyThing)
router.delete('/:id', auth,  stuffCtrl.deleteThing)  
router.post ('/:id/rating', stuffCtrl.rateThing)







  module.exports = router