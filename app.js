
import express from "express";
import ejs from "ejs";
import * as db from "./db.js"
import bodyParser from "body-parser";


//create variable representing express
const app = express();

//set public folder for static web pages
app.use(express.static('public'));
app.use(express.static('styling'));

//set dynamic web pages, set views and engine
app.set('view engine', 'ejs');

// Set up body parser middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
// Use body-parser middleware to send JSON data
app.use(bodyParser.json());

//////Routing//////
app.get('/', async (req, res) => {
    const pageTitle = "Dynamic webpage";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', { pageTitle, dbData });
});


// app.get('/exempel', async (req, res) => {
//     let cols = ["first", "second", "one", "4", "c"]
//     let buildQuery = (cols) => {
//         let colQuery = "";
//         for (let i = 0; i < cols.length; i++) {
//             if (i < cols.length - 1) {
//                 colQuery += cols[i] + ",";
//             } else {
//                 colQuery += cols[i]
//             }
//         }
//         let queryStart = "INSERT INTO(" + colQuery + ") WHERE fdsaf";
//         console.log(queryStart);
//     }
//     buildQuery(cols);


// const pageTitle = "Dynamic webpage";
// const sql = 'SHOW tables';
// const dbData = await db.query(sql);
// console.log(dbData);
// res.render('index', { pageTitle, dbData });
// });

let currentTable;
app.post('/', async (req, res) => {
    console.log(req.body);
    const tableName = req.body;
    const pageTitle = "Dynamic webpage";
    const sql = `SELECT * FROM ${tableName.table_name}`;
    currentTable = tableName.table_name
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', { pageTitle, dbData });
});

//ADD NEW STUDENT
app.get('/addStudent', async (req, res) => {
    const pageTitle = "Add Student";
    res.render('addStudent', { pageTitle });
});

app.post('/addStudent', async (req, res) => {
    const { firstName, lastName, town } = req.body;
    const sql = `INSERT INTO students (fName, lName, town) VALUES (?, ?, ?)`;
    try {
        await db.query(sql, [firstName, lastName, town]);
        res.redirect('/'); // Redirect till startsidan efter att studenten har lagts till
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Error adding student. Please try again later.");
    }
});
//ADD NEW COURSE
app.get('/addCourse', (req, res) => {
    const pageTitle = "Add Course";
    res.render('addCourse', { pageTitle });
});

app.post('/addCourse', async (req, res) => {
    const { courseName, courseDescription } = req.body;
    const sql = `INSERT INTO courses (name, description) VALUES (?, ?)`;
    try {
        await db.query(sql, [courseName, courseDescription]);
        res.redirect('/');

    } catch (error) {
        console.error("Error adding course:", error);
        console.log(error)
        res.status(500).send("Error adding course. Please try again later.");
    }
});

//ADD NEW RELATION BETWEEN STUDENT AND COURSE
app.get('/addRelation', (req, res) => {
    const pageTitle = "Add Relation";
    res.render('addRelation', { pageTitle });
});

app.post('/addRelation', async (req, res) => {
    const { studentId, courseId } = req.body;
    const sql = `INSERT INTO students_courses (students_id, courses_id) VALUES (?, ?)`;
    try {
        await db.query(sql, [studentId, courseId]);
        res.redirect('/');

    } catch (error) {
        console.error("Error adding course:", error);
        console.log(error)
        res.status(500).send("Error adding course. Please try again later.");
    }
});

app.get('/removeData', async (req, res) => {

    const pageTitle = "Dynamic webpage";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('removeData', { pageTitle, dbData });
});
app.post('/removeData', async (req, res) => {
    console.log(req.body);
    const requestData = req.body;
    const pageTitle = "Dynamic webpage";
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    //get table data
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage
    res.render('removeData', { pageTitle, dbData, dbDataHeaders });
});

//return different Json table data

//Retruns all students in Json format
app.get('/students', async (req, res) => {
    let sql = "";
    const { id } = req.query;
    console.log(id);
    if (id) {
        sql = `SELECT * FROM students WHERE id = ${id}`;
    } else {
        sql = `SELECT * FROM students`;
    }
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});

//Returns data on what courses a sepcific student name, student lastname or student id is written
app.get("/students/:studentName/courses", async (req, res) => {
    let studentQuery = [req.params.studentName]
    const result = await db.query(
        `SELECT c.* FROM Courses c JOIN Students_Courses sc ON (c.id = sc.Courses_id) JOIN Students s ON (sc.Students_id = s.id) WHERE s.lName = "${studentQuery}" OR s.fName = "${studentQuery}" OR s.town = "${studentQuery}" OR s.id = "${studentQuery}"`
    );
    res.json(result);
});

//return specific student in Json format
app.get("/students/:studentName", async (req, res) => {
    // const [result] = await db.query("SELECT * FROM students WHERE fName = ?", [req.params.studentName]);
    const result = await db.query(`SELECT * FROM students WHERE fName = "${req.params.studentName}"`);
    res.json(result);
});

// app.get('/courses', async (req, res) => {
//     let sql = "";
//     const { id } = req.query;
//     console.log(id);
//     if (id) {
//         sql = `SELECT * FROM courses WHERE id = ${id}`;
//     }
//     else {
//         sql = `SELECT * FROM courses`;
//     }
//     const dbData = await db.query(sql);
//     console.log(dbData);
//     res.json(dbData);
// });

app.get('/courses', async (req, res) => {
    let sql = "";
    const id = req.query.id;
    const name = req.query.name;
    const description = req.query.description;
    console.log(`SELECT * FROM courses WHERE name LIKE "%${name}%" AND description LIKE "%${description}%"`);
    if (id) {
        sql = `SELECT * FROM Courses WHERE id = ${id}`;
    } else if (name || description) {
        sql = `SELECT * FROM Courses WHERE name LIKE "%${name}%" OR description LIKE "%${description}%"`;
    } else {
        sql = `SELECT * FROM courses`
    }
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});


app.get("/courses/:courseInfo", async (req, res) => {
    let courseQuery = [req.params.courseInfo]
    const result = await db.query(
        `SELECT s.* FROM Students s JOIN Students_Courses sc ON (s.id = sc.Students_id) JOIN Courses c ON (sc.Courses_id = c.id) WHERE c.id = "${courseQuery}" LIKE c.name = "${courseQuery}"`
    );
    res.json(result);
});


//Returns all associations between students and courses
app.get('/students_courses', async (req, res) => {
    let sql = "";
    const { id } = req.query;
    if (id) {
        sql = "SELECT * FROM Students_Courses WHERE id = ${id}";
    } else {
        sql = "SELECT * FROM Students_Courses";
        ;
    }
    const dbData = await db.query(sql);
    console.log(dbData);
    res.json(dbData);
});


//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});