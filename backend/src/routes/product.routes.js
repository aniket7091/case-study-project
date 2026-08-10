const express = require("express");

const router = express.Router();

const productController =
    require("../controllers/product.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");


// All product and inventory APIs require authentication and ADMIN role
router.use(protect);
router.use(authorizeRoles("ADMIN"));



// PRODUCTS


// Create product
router.post(
    "/",
    productController.createProduct
);


// Get products
router.get(
    "/",
    productController.getProducts
);


// Get single product
router.get(
    "/:id",
    productController.getProductById
);


// Update product
router.put(
    "/:id",
    productController.updateProduct
);



// STOCK


// Add IN / OUT stock movement
router.post(
    "/:id/stock",
    productController.addStockMovement
);


// Get stock movement history
router.get(
    "/:id/stock",
    productController.getStockMovements
);


module.exports = router;