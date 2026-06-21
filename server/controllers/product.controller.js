import { pool } from "../config/connectDB.js";

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = req.body;

    if (
      !name ||
      !image?.[0] ||
      !category?.[0] ||
      !unit ||
      !price ||
      !description
    ) {
      return res.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    const query = `
      INSERT INTO products
      (name, category, sub_category, unit, stock, price, discount, description, more_details)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      name,
      JSON.stringify(category),
      JSON.stringify(subCategory),
      unit,
      stock || 0,
      price,
      discount || 0,
      description,
      JSON.stringify(more_details || {}),
    ];

    const result = await pool.query(query, values);
    const product = result.rows[0];

    // insert images
    if (image && image.length > 0) {
      for (let img of image) {
        await pool.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)",
          [product.id, img],
        );
      }
    }

    return res.json({
      message: "Product Created Successfully",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.body;

    const offset = (page - 1) * limit;

    let query;
    let values;

    if (search && search.trim() !== "") {
      query = `
        SELECT 
          p.*,
          COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL),'[]') AS image,
          ts_rank(
            setweight(to_tsvector('english', coalesce(p.name,'')), 'A') ||
            setweight(to_tsvector('english', coalesce(p.description,'')), 'B'),
            plainto_tsquery($1)
          ) AS rank
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        WHERE 
          setweight(to_tsvector('english', coalesce(p.name,'')), 'A') ||
          setweight(to_tsvector('english', coalesce(p.description,'')), 'B')
          @@ plainto_tsquery($1)
        GROUP BY p.id
        ORDER BY rank DESC
        LIMIT $2 OFFSET $3
      `;
      values = [search, limit, offset];
    } else {
      query = `
        SELECT 
          p.*,
          COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL),'[]') AS image
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      values = [limit, offset];
    }

    const dataResult = await pool.query(query, values);

    const countResult = await pool.query(`SELECT COUNT(*) FROM products`);

    return res.json({
      message: "Product data",
      success: true,
      error: false,
      totalCount: parseInt(countResult.rows[0].count),
      totalNoPage: Math.ceil(countResult.rows[0].count / limit),
      data: dataResult.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const { id } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM products
      WHERE category @> $1
      LIMIT 15
      `,
      [JSON.stringify([id])],
    );

    return res.json({
      message: "category product list",
      data: result.rows,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategoryAndSubCategory = async (req, res) => {
  try {

    let {
      categoryId,
      subCategoryId,
      page = 1,
      limit = 10,
    } = req.body;

    if (
      categoryId === undefined ||
      subCategoryId === undefined
    ) {
      return res.status(400).json({
        message: "Provide categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(pi.image_url)
          FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) AS image
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id = p.id
      WHERE 
        p.category::text LIKE $1
        AND
        p.sub_category::text LIKE $2
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const values = [
      `%"id": ${Number(categoryId)}%`,
      `%"id": ${Number(subCategoryId)}%`,
      limit,
      offset,
    ];

    const dataResult = await pool.query(query, values);

    const countQuery = `
      SELECT COUNT(*) 
      FROM products p
      WHERE 
        p.category::text LIKE $1
        AND
        p.sub_category::text LIKE $2
    `;

    const countResult = await pool.query(countQuery, [
      `%"id": ${Number(categoryId)}%`,
      `%"id": ${Number(subCategoryId)}%`,
    ]);

    return res.json({
      message: "Product list",
      data: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].count),
      page,
      limit,
      success: true,
      error: false,
    });

  } catch (error) {

    console.log("CATEGORY PRODUCT ERROR", error);

    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductDetails = async (req, res) => {
  try {

    const { productId } = req.body;

    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(pi.image_url)
          FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) AS image
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(query, [
      Number(productId)
    ]);

    return res.json({
      message: "product details",
      data: result.rows[0],
      error: false,
      success: true
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });

  }
};

// update product
export const updateProductDetails = async (req, res) => {
  try {

    const {
      id,
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
        error: true,
        success: false,
      });
    }

    await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        category = $2,
        sub_category = $3,
        unit = $4,
        stock = $5,
        price = $6,
        discount = $7,
        description = $8,
        more_details = $9,
        updated_at = NOW()
      WHERE id = $10
      `,
      [
        name,
        JSON.stringify(category),
        JSON.stringify(subCategory),
        unit,
        stock,
        price,
        discount,
        description,
        JSON.stringify(more_details || {}),
        id,
      ]
    );

    // remove old images
    await pool.query(
      `DELETE FROM product_images WHERE product_id = $1`,
      [id]
    );

    // insert new images
    if (image && image.length > 0) {
      for (let img of image) {
        await pool.query(
          `
          INSERT INTO product_images
          (product_id, image_url)
          VALUES ($1,$2)
          `,
          [id, img]
        );
      }
    }

    return res.json({
      message: "Product updated successfully",
      success: true,
      error: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
// delete product
export const deleteProductDetails = async (req, res) => {
  try {

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Product id is required",
        success: false,
        error: true,
      });
    }

    // delete images first
    await pool.query(
      `DELETE FROM product_images WHERE product_id = $1`,
      [id]
    );

    // delete product
    await pool.query(
      `DELETE FROM products WHERE id = $1`,
      [id]
    );

    return res.json({
      message: "Product deleted successfully",
      success: true,
      error: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
//search
export const searchProduct = async (req, res) => {
  try {

    let { search, page, limit } = req.body;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

    const offset = (page - 1) * limit;

    let query = `
      SELECT
        p.*,
        COALESCE(
          json_agg(pi.image_url)
          FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'
        ) AS image
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id = p.id
    `;

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
    `;

    let values = [];
    let countValues = [];

    if (search && search.trim() !== "") {

      query += `
        WHERE
          p.name ILIKE $1
          OR p.description ILIKE $1
      `;

      countQuery += `
        WHERE
          p.name ILIKE $1
          OR p.description ILIKE $1
      `;

      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
    }

    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    values.push(limit);
    values.push(offset);

    const dataResult = await pool.query(query, values);

    const countResult = await pool.query(
      countQuery,
      countValues
    );

    const totalCount = parseInt(
      countResult.rows[0].total
    );

    return res.json({
      message: "Product data",
      error: false,
      success: true,
      data: dataResult.rows,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
      page,
      limit,
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });

  }
};






