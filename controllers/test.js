

exports.getTest = (req, res, next) => {
    console.log("Get test !")
    res.status(201).json({message: "test test message"})
}
