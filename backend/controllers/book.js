const Book = require('../models/book')
const fs = require('fs');

exports.createThing = (req, res, next) => {
    const bookData = JSON.parse(req.body.book);
    delete bookData._id;
    delete bookData._userId;
    const book = new Book({
        ...bookData,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'opbjet enregistré' }))
        .catch((error) => { res.status(400).json({ error }) })
}


exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete thingObject._userId;

    // Récupérer le chemin de l'ancienne image depuis la base de données
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                const oldImagePath = book.imageUrl;
                
                // Supprimer l'ancienne image du système de fichiers
                if (req.file && oldImagePath) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Erreur lors de la suppression de l'ancienne image :", err);
                        } else {
                            console.log("Ancienne image supprimée avec succès :", oldImagePath);
                        }
                    });
                }

                // Mettre à jour les informations du livre dans la base de données
                Book.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Objet modifié!'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

   


exports.BibliothequeThing = (req, res, next) => {
    Book.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(404).json({ error }))
}

exports.deleteThing = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(thing => {
            if (thing.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };



exports.IdThing = (req, res, next) => {
    const bookId = req.params.id;

    Book.findById(bookId)
        .then((book) => {
            if (!book) {
                return res.status(404).json({
                    message: "Livre non trouvé.",
                    error: error,
                });
            }

            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(500).json({
                message:
                    "Une erreur est survenue lors de la récupération du livre.",
                error: error,
            });
        });
};

exports.rateThing = (req, res, next) => {
    const bookId = req.params.id;
    const { userId, rating } = req.body;

    // note 0-5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({
            error: "INVALID_RATING",
            message: "La note doit être un chiffre entre 0 et 5.",
        });
    }



    Book.findById(bookId)

        .then((book) => {
            console.log('0 create');
            if (!book) {
                throw new Error("BOOK_NOT_FOUND");
            }

            return Book.findOne({ _id: bookId, "ratings.userId": userId }).then(
                (alreadyRated) => {
                    if (alreadyRated) {
                        throw new Error("ALREADY_RATED");
                    }

                    const grades = book.ratings.map((rating) => rating.grade);
                    const sumRatings = grades.reduce(
                        (total, grade) => total + grade,
                        0
                    );

                    const newTotalRating = sumRatings + rating;
                    const newAverageRating = Number(
                        (newTotalRating / (book.ratings.length + 1)).toFixed(2)
                    );
                    book.ratings.push({ userId, grade: rating });
                    book.averageRating = newAverageRating;
                    return book.save().then((updatedBook) => {
                        res.status(201).json({
                            ...updatedBook._doc,
                            id: updatedBook._doc._id,
                        });
                    });
                }
            );
        })

        .catch((error) => {
            if (error.message === "BOOK_NOT_FOUND") {
                return res.status(404).json({
                    error: error.message,
                    message: "Le livre est introuvable.",
                });
            } else if (error.message === "ALREADY_RATED") {
                return res.status(403).json({
                    error: error.message,
                    message: "Ce livre a deja une note.",
                });
            } else {
                return res.status(500).json({
                    error: error.message,
                    message:
                        "Erreur lors de la notation du livre",
                });
            }
        });
};


