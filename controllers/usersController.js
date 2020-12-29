const User = require('../models/userModel');

exports.add = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
}

exports.edit = () => {

}

exports.get = () => {

}

exports.remove = () => {

}
