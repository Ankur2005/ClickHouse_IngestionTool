const createClickHouseClient = require('../models/clickHouse.model.js');
const { writeDataToCSV } = require('../models/fileProcess.js');
const fs = require('fs');
const path = require('path');

async function connect(req, res) {
    const { host, port, username, token, database, protocol = 'http' } = req.body;

    if (!host || !port || !username || !database) {
        return res.status(400).json({
            success: false,
            error: 'Missing required connection parameters: host, port, username, token, database',
        });
    }

    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort)) {
        return res.status(400).json({
            success: false,
            error: 'Port must be a valid number',
        });
    }

    try {
        const client = await createClickHouseClient({
            host,
            port: parsedPort,
            username,
            token,
            database,
            protocol,
        });

        const result = await client.query('SELECT 1').toPromise();

        if (Array.isArray(result) && result.length > 0) {
            req.session.connectionConfig = { host, port: parsedPort, database, token, protocol };
            return res.status(200).json({
                success: true,
                message: 'Connected to ClickHouse successfully',
                result,
            });
        } else if (result?.data && result.data.length > 0) {
            req.session.connectionConfig = { host, port: parsedPort, database, token, protocol };
            return res.status(200).json({
                success: true,
                message: 'Connected to ClickHouse successfully',
                result: result.data,
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Connected, but did not receive expected data from ClickHouse.',
                result,
            });
        }
    } catch (error) {
        console.error('[ClickHouse Connection Error]', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to connect to ClickHouse: ' + (error.message || 'Unknown error'),
        });
    }
}

async function getTables(req, res) {
    try {
        const query = "SHOW TABLES";
        
        const result = await req.clickhouse.query(query).toPromise();
        res.json(result.data || result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getTableSchema(req, res) {
    try {
        const { table } = req.params;
        const query = `DESCRIBE TABLE ${table} FORMAT JSON`;
        const result = await req.clickhouse.query(query).toPromise();
        res.json(result.data || result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function exportTableToCSV(req, res) {
    try {
        const { table } = req.params;
        const columnsQuery = req.query.columns;
        const cols = (columnsQuery && typeof columnsQuery === 'string' && columnsQuery.trim().length > 0)
            ? columnsQuery.split(',').map(c => c.trim()).join(', ')
            : '*';
            
        const query = `SELECT ${cols} FROM ${table} FORMAT CSVWithNames`;
        const result = await req.clickhouse.query(query).toPromise();

        const outputDir = './data';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `${table}.csv`);
        await writeDataToCSV(result, outputPath);
        res.download(outputPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function exportJoinResult(req, res) {
    try {
        const { tables, joinKey, columns } = req.body;
        if (!tables || !Array.isArray(tables) || tables.length < 2 ||
                !joinKey || !columns || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({ error: 'tables (array of at least two), joinKey, and columns (non-empty array) are required' });
        }
        const table1 = tables[0];
        const table2 = tables[1];
        const cols = columns.join(', ');
        const query = `
            SELECT ${cols}
            FROM ${table1}
            JOIN ${table2}
            ON ${table1}.${joinKey} = ${table2}.${joinKey}
            FORMAT CSVWithNames
        `;
        const result = await req.clickhouse.query(query).toPromise();

        const outputDir = './data';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `${table1}_JOIN_${table2}.csv`);
        await writeDataToCSV(result, outputPath);
        res.download(outputPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function previewTable(req, res) {
    try {
        const { table } = req.params;
        const columnsQuery = req.query.columns;
        const cols = (columnsQuery && typeof columnsQuery === 'string' && columnsQuery.trim().length > 0)
            ? columnsQuery.split(',').map(c => c.trim()).join(', ')
            : '*';
        const query = `SELECT ${cols} FROM ${table} LIMIT 100 FORMAT JSON`;
        const result = await req.clickhouse.query(query).toPromise();
        res.json(result.data || result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    connect,
    getTables,
    getTableSchema,
    exportTableToCSV,
    exportJoinResult,
    previewTable,
};