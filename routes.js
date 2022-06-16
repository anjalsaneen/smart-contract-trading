const routes = require("next-routes")();

routes
  .add("/product/create", "/product/create")
  .add("/product/buy/:id", "/product/buyProduct")

module.exports = routes;
