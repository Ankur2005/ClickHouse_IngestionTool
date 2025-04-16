const { parseCSVFile } = require('../models/fileProcess');
const fs = require('fs');

module.exports = async function ingestCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    const raw = fs.readFileSync(filePath, 'utf-8');

    const rows = await parseCSVFile(filePath);
    if (!rows || rows.length === 0) {
      cleanup(filePath);
      return res.status(400).json({ error: 'Uploaded CSV file is empty or invalid' });
    }


    const tableName = req.body.tableName;
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
      cleanup(filePath);
      return res.status(400).json({ error: 'Invalid or missing table name' });
    }

    const columns = Object.keys(rows[0]).map(key => key.trim());

    const isValidSchema = rows.every(row => {
      const keys = Object.keys(row).map(key => key.trim());
      return keys.length === columns.length && keys.every(key => columns.includes(key));
    });

    if (!isValidSchema) {
      cleanup(filePath);
      return res.status(400).json({ error: 'Inconsistent CSV schema across rows' });
    }

    const values = rows.map(row => {
      const rowValues = columns.map(col => {
        let val = row[col] || row[col.toLowerCase()];
        if (typeof val === 'string') {
          val = val.trim();
        }
        if (val === '' || val === null || val === undefined) {
          return 'NULL';
        }
        const escaped = String(val)
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'");
        return `'${escaped}'`;
      });
      return `(${rowValues.join(', ')})`;
    }).join(', ');

    const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values}`;
    console.log('Insert Query:', insertQuery);

    await req.clickhouse.query(insertQuery).toPromise();

    cleanup(filePath);

    res.json({ message: 'Data ingested successfully', insertedRows: rows.length });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      cleanup(req.file.path);
    }
    res.status(500).json({ error: `Failed to process CSV: ${err.message}` });
  }
}

function cleanup(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, err => {
      if (err) console.error('Error deleting file:', err.message);
    });
  }
}