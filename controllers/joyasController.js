const pool = require('../db');

// HATEOAS 
const formatHATEOAS = (joyas, baseUrl) => {
    return {
        totalJoyas: joyas.length,
        data: joyas.map(joya => ({
            ...joya,
            links: {
                self: `${baseUrl}/joyas/${joya.id}`,
                collection: `${baseUrl}/joyas`
            }
        }))
    };
};

// GET /joyas - HATEOAS, página, order by
const getJoyas = async (req, res) => {
    try {
        let { limits = 10, page = 1, order_by = "id_ASC" } = req.query;

        // página
        const offset = (page - 1) * limits;

        // orden
        const [orderColumn, orderDirection] = order_by.split("_");
        const validColumns = ['id', 'nombre', 'categoria', 'metal', 'precio', 'stock'];
        if (!validColumns.includes(orderColumn) || !['ASC', 'DESC'].includes(orderDirection)) {
            return res.status(400).json({ error: "Invalid order_by parameter" });
        }

        // totales
        const totalJoyasQuery = 'SELECT COUNT(*) FROM inventario';
        const stockTotalQuery = 'SELECT SUM(stock) FROM inventario';
        const totalJoyasResult = await pool.query(totalJoyasQuery);
        const stockTotalResult = await pool.query(stockTotalQuery);

        const totalJoyas = parseInt(totalJoyasResult.rows[0].count, 10);
        const stockTotal = parseInt(stockTotalResult.rows[0].sum, 10);





        const joyasQuery = `SELECT id, nombre FROM inventario ORDER BY ${orderColumn} ${orderDirection} LIMIT $1 OFFSET $2`;
        const { rows } = await pool.query(joyasQuery, [limits, offset]);


        const results = rows.map(joya => ({
            name: joya.nombre,
            href: `/joyas/joya/${joya.id}`
        }));

        res.json({
            totalJoyas,
            stockTotal,
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// ruta GET /joyas/filtros
const getFilteredJoyas = async (req, res) => {
    try {
        let { precio_min, precio_max, categoria, metal } = req.query;
        let query = 'SELECT * FROM inventario WHERE 1=1';
        let values = [];
        
        if (precio_min) {
            values.push(precio_min);
            query += ` AND precio >= $${values.length}`;
        }
        if (precio_max) {
            values.push(precio_max);
            query += ` AND precio <= $${values.length}`;
        }
        if (categoria) {
            values.push(categoria);
            query += ` AND categoria = $${values.length}`;
        }
        if (metal) {
            values.push(metal);
            query += ` AND metal = $${values.length}`;
        }
        
        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getJoyas, getFilteredJoyas };
