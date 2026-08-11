const express = require("express");

const router = express.Router();

const productController =
    require("../controllers/product.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");


// All product and inventory APIs require authentication
router.use(protect);



// PRODUCTS


// Create product (ADMIN only)
router.post(
    "/",
    authorizeRoles("ADMIN"),
    productController.createProduct
);


// Get products (ADMIN + WAREHOUSE + SALES - SALES needs to browse products for challans)
router.get(
    "/",
    authorizeRoles("ADMIN", "WAREHOUSE", "SALES"),
    productController.getProducts
);


// Get single product (ADMIN + WAREHOUSE + SALES)
router.get(
    "/:id",
    authorizeRoles("ADMIN", "WAREHOUSE", "SALES"),
    productController.getProductById
);


// Update product (ADMIN only)
router.put(
    "/:id",
    authorizeRoles("ADMIN"),
    productController.updateProduct
);



// STOCK


// Add IN / OUT stock movement (ADMIN + WAREHOUSE)
router.post(
    "/:id/stock",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    productController.addStockMovement
);


// Get stock movement history (ADMIN + WAREHOUSE)
router.get(
    "/:id/stock",
    authorizeRoles("ADMIN", "WAREHOUSE"),
    productController.getStockMovements
);


module.exports = router;