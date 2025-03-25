const express = require("express");
const multer = require("multer");
const cors = require('cors');
const docxConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Ensure 'files' directory exists
const filesDir = path.join(__dirname, "files");
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}
app.use(cors());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Setting up file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
    // limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    
});


app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        // Defining output file path
        let outputPath = path.join(__dirname, "files", `${path.parse(req.file.originalname).name}.pdf`);

        docxConverter(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.error("Conversion Error:", err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }

            // Send the converted file
            res.download(outputPath, () => {
                console.log("File downloaded");
            });
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
