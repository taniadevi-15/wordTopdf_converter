const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxConverter = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Ensure 'files' and 'uploads' directories exist
["files", "uploads"].forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// API route
app.post("/convertFile", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const outputPath = path.join(__dirname, "files", `${path.parse(req.file.originalname).name}.pdf`);

    docxConverter(req.file.path, outputPath, (err, result) => {
        if (err) {
            console.error("Conversion Error:", err);
            return res.status(500).json({ message: "Error converting docx to pdf" });
        }

        res.download(outputPath, () => {
            console.log("File downloaded");
        });
    });
});

// ✅ Serve frontend static files
const frontendPath = path.join(__dirname, "../Frontend/dist");
app.use(express.static(frontendPath));

// ✅ Catch-all route for React
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
