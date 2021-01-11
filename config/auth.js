module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Por favor faça o login para ver conteúdo');
        res.redirect('/users/login');
    }
}