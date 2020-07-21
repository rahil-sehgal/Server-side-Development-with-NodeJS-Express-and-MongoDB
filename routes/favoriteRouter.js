const express = require('express');
const bodyParser = require('body-parser');

const cors = require('./cors');


const favoriteRouter = express.Router();
var authenticate = require('../authenticate');
const favorites = require('../models/favorite');
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    favorites.find({})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite == null) {
                favorites.create()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        for (const i in req.body) {
                            favorite.dishes.push(req.body[i]);
                        }
                        favorite.save()
                        res.json(favorite);
                    }, (err) => next(err));
            } else {
                for (const i in req.body) {
                    favorites.findOne({user: newFavorite.user})
                        .then((oldFavorite) => {
                            if (oldFavorite == null) {
                                favorite.dishes.push(req.body[i]);
                            }
                        });
                }
                favorite.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(favorite);
            }
        })
        .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    favorites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    favorites.findById(req.params.dishId)
        .then((favorite) => {
            if (!(favorite.user.equals(req.user._id))) {
                var err = new Error('Only creator can perform this');
                err.status = 401;
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findById(req.body._id)
        .then((favorite) => {
            if (favorite == null) {
                let newFavorite = {};
                newFavorite.user = req.user._id;
                Favorites.create(newFavorite)
                    .then((favorite) => {
                        console.log('Favorite Created ', newFavorite);
                        favorite.dishes.push(req.params.favoriteId)
                        favorite.save()
                            .then((favorite) => {
                                Dishes.findById(favorite._id)
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            }, (err) => next(err));
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                err = new Error('Dish ' + req.params.dishId + ' already exist');
                err.status = 404;
                return next(err);
            }
        })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            favorite.dishes.remove(req.params.favoriteId);
            favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
        })
        .catch((err) => next(err));
});

module.exports = favoriteRouter;