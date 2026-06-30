module.exports = function(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) { //Caso o usuário não tenha o role requisitado, retorna erro.
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
    }
    next();
  };
};
