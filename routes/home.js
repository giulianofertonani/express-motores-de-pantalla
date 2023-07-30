const express= require("express");
const router= express.Router();

router.get("/", (req,res) => {
    const urls= [
        {origin: "www.google.com/bluuweb1", shortURL: "jsajdasj1"},
        {origin: "www.google.com/bluuweb2", shortURL: "jsajdasj2"},
        {origin: "www.google.com/bluuweb3", shortURL: "jsajdasj3"},
        {origin: "www.google.com/bluuweb4", shortURL: "jsajdasj4"},
    ];
    res.render("home", {urls: urls});
});




module.exports = router;