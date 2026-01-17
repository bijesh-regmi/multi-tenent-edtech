const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            console.log(error);
            next(error.message);
        });
    };
};

export default asyncHandler;
