const express = require('express')
const router = express.Router ()
const stuffCtrl = require('../controllers/book')
const auth = require ('../middleware/auth')
const multer = require ('../middleware/multer-config')



router.get('/',   stuffCtrl.BibliothequeThing)
router.get('/:id',  stuffCtrl.IdThing)
router.post ('/', auth, multer,   stuffCtrl.createThing)
router.put('/:id', auth, stuffCtrl.modifyThing)
router.delete('/:id', auth,  stuffCtrl.deleteThing)  
router.post ('/:id/rating', stuffCtrl.rateThing)







  module.exports = router