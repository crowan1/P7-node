const multer = require('multer')

const MIME_TYPES = {
    'image/jpg ': 'jpg',
    'image/jpeg': 'jpg',
    'image/png' : 'png'
}

const storage = multer.diskStorage({
    destination : (req,file , callback)=>{
        callback( null , 'images')
    },
    filename : (req,file, callback)=>{
        const name = file.originalname.split(' ').join('_');
        console.log(file.mimetype)
        const extension = MIME_TYPES[file.mimetype]
        callback(null, name + Date.now() + '.' + extension)
    }
})

const fileFilter = (req, file, callback) => {
    const isValid = MIME_TYPES[file.mimetype];
    if (isValid) {
        callback(null, true);
    } else {
        callback(new Error("Type de fichier non pris en charge."), false);
    }
};


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024, 
    },
    fileFilter: fileFilter,
}).single("image");


const compressImage = (req, res, next) => {
    if (!req.file) {
        return next();
    }
    const filePath = req.file.path;

    sharp(filePath)
        .resize({ fit: "cover", height: 643, width: 500 })
        .webp({ quality: 85 })
        .toBuffer()
        .then((data) => {
            sharp(data)
                .toFile(filePath)
                .then(() => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
};


const uploadImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message:
                        "La taille du fichier est trop importante (4 Mo maximum).",
                });
            } else if (err.message === "Type de fichier non pris en charge.") {
                return res.status(400).json({ message: err.message });
            } else {
                // Autre erreur
                return res.status(400).json({ message: err.message });
            }
        }

        next();
    });
};


module.exports = uploadImage
module.exports = compressImage



module.exports = multer({storage}).single('image') 

