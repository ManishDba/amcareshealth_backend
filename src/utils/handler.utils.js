const errorHandler = (res, error, status = 400) => {
    console.error('Error occurred:', error);
    res.status(status).json({ msg: error.message });
}

const successHandler = (res, data) => {
    res.status(200).json({ success: true, ...data });
}

const handlerWithMsg = (res, msg, code = 200) => {
    res.status(code).json({ msg });
}

module.exports = { errorHandler, successHandler, handlerWithMsg }