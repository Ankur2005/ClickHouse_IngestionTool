const express = require('express');
const cors = require('cors');
const fileURLToPath = require('url');
const fileUpload = require('express-fileupload');
const session = require('express-session');

const clickhouseRoutes = require('./routes/clickhouse');
const flatfileRoutes = require('./routes/flatfile');

const app = express();


app.use(session({
    secret: 'ingest_secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        httpOnly:true
    }
}));
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(fileUpload());
app.use('/api/clickhouse', clickhouseRoutes);
app.use('/api/flatfile', flatfileRoutes);
app.use('/api/ingest', require('./routes/ingestionRoute'));

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
