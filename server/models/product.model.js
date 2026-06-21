import { pool } from "../config/connectDB.js"

export const createProduct = async (productData) => {

    const {
        name,
        image,
        unit,
        stock,
        price,
        discount,
        description,
        more_details,
        publish
    } = productData

    const query = `
        INSERT INTO products
        (name,unit,stock,price,discount,description,more_details,publish)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
    `

    const values = [
        name,
        unit,
        stock,
        price,
        discount,
        description,
        JSON.stringify(more_details || {}), 
        publish
    ]

    const result = await pool.query(query, values)
    const product = result.rows[0]

    if (image && image.length > 0) {
        for (let img of image) {
            await pool.query(
                "INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)",
                [product.id, img]
            )
        }
    }

    return product
}



export const getAllProducts = async (search = "") => {

    let result;

    if (search && search.trim() !== "") {
        // 🔍 SEARCH QUERY (uses your index)
        result = await pool.query(`
            SELECT 
                p.*,
                COALESCE(
                    json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL),
                    '[]'
                ) AS image,
                ts_rank(
                    setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(p.description, '')), 'B'),
                    plainto_tsquery($1)
                ) AS rank
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE 
                setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(p.description, '')), 'B')
                @@ plainto_tsquery($1)
            GROUP BY p.id
            ORDER BY rank DESC
        `, [search]);

    } else {
       
        result = await pool.query(`
            SELECT 
                p.*,
                COALESCE(
                    json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL),
                    '[]'
                ) AS image
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
    }

    return result.rows
}


export const getProductById = async (id) => {

    const result = await pool.query(`
        SELECT 
            p.*,
            COALESCE(
                json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL),
                '[]'
            ) AS image
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        WHERE p.id = $1
        GROUP BY p.id
    `,[id])

    return result.rows[0]
}