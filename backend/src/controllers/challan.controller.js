const challanService =
    require("../services/challan.service");

const {
    validateChallan,
    validateCancelChallan
} = require("../validators/challan.validator");



// CREATE CHALLAN


const createChallan = async (
    req,
    res
) => {

    try {

        const {
            isValid,
            errors
        } = validateChallan(
            req.body
        );


        if (!isValid) {

            return res.status(400).json({
                success: false,
                message:
                    "Validation failed",
                errors
            });
        }


        const challan =
            await challanService.createChallan(
                req.body,
                req.user.id
            );


        return res.status(201).json({

            success: true,

            message:
                "Sales challan created successfully",

            data: challan

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};



// GET ALL CHALLANS


const getChallans = async (
    req,
    res
) => {

    try {

        const {
            search,
            status,
            page = 1,
            limit = 10
        } = req.query;


        const result =
            await challanService.getChallans({

                search,

                status,

                page:
                    Number(page),

                limit:
                    Number(limit)

            });


        return res.status(200).json({

            success: true,

            data:
                result.challans,

            pagination:
                result.pagination

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};



// GET CHALLAN BY ID


const getChallanById = async (
    req,
    res
) => {

    try {

        const challan =
            await challanService
                .getChallanById(
                    req.params.id
                );


        return res.status(200).json({

            success: true,

            data: challan

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });
    }
};



// CONFIRM CHALLAN


const confirmChallan = async (
    req,
    res
) => {

    try {

        const result =
            await challanService
                .confirmChallan(

                    req.params.id,

                    req.user.id

                );


        return res.status(200).json({

            success: true,

            message:
                "Sales challan confirmed successfully",

            data: result

        });

    } catch (error) {

        const statusCode =
            error.message
                .toLowerCase()
                .includes(
                    "insufficient stock"
                )
                ? 400
                : 500;


        return res.status(
            statusCode
        ).json({

            success: false,

            message:
                error.message

        });
    }
};



// CANCEL CHALLAN


const cancelChallan = async (
    req,
    res
) => {

    try {

        const {
            isValid,
            errors
        } =
            validateCancelChallan(
                req.body
            );


        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation failed",

                errors

            });
        }


        const challan =
            await challanService
                .cancelChallan(

                    req.params.id,

                    req.body.reason

                );


        return res.status(200).json({

            success: true,

            message:
                "Sales challan cancelled successfully",

            data: challan

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
};


module.exports = {

    createChallan,

    getChallans,

    getChallanById,

    confirmChallan,

    cancelChallan

};