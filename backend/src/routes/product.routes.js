const express = require("express");

const router = express.Router();

const productController =
    require("../controllers/product.controller");

const { protect } =
    require("../middleware/auth.middleware");


// All product/inventory APIs require login
router.use(protect);



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