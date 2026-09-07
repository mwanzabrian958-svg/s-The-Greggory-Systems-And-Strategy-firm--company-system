/**
 * Blog Management Router — The Greggory Systems & Strategy Firm (desktop project)
 * =============================================================================
 * Dedicated module for THIS project (the desktop system). It shares the SAME
 * databases as the website backend — both read the DB_* variables from .env
 * (Aiven cloud + local XAMPP standby, schema `the_greggory_systems_and_strategy_firm_db_main`)
 * — so blog articles created here are immediately visible on the website and
 * vice-versa.
 *
 * Usage (in server.js / any Express app):
 *   import { createBlogRouter } from "./modules/blog.js";
 *   app.use("/api/blog-articles", createBlogRouter(mainDb));
 *
 * mainDb is the shared connection pool (mysql2/promise). All queries use
 * ? placeholders so SQL-injection is not possible.
 */
import express from "express";

export function createBlogRouter(db) {
  const router = express.Router();

  // ---- GET all blog articles (soft-deleted are hidden) ----
  router.get("/", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM blog_articles WHERE deleted_at IS NULL ORDER BY created_at DESC"
      );
      res.json({ success: true, articles: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch blog articles" });
    }
  });

  // ---- GET single blog article ----
  router.get("/:id", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM blog_articles WHERE id = ? AND deleted_at IS NULL",
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Blog article not found" });
      }
      res.json({ success: true, article: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch blog article" });
    }
  });

  // ---- CREATE blog article ----
  router.post("/", async (req, res) => {
    try {
      const { title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: "Title and content are required" });
      }
      const [result] = await db.query(
        "INSERT INTO blog_articles (title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published, published_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [title, excerpt || null, content, author || null, read_time || null, category || null, image_url || null, image_id || null, icon_class || null, is_published ? 1 : 0, is_published ? new Date() : null]
      );
      res.status(201).json({ success: true, message: "Blog article created successfully", id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to create blog article" });
    }
  });

  // ---- UPDATE blog article ----
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, excerpt, content, author, read_time, category, image_url, image_id, icon_class, is_published } = req.body;
      const [result] = await db.query(
        "UPDATE blog_articles SET title = ?, excerpt = ?, content = ?, author = ?, read_time = ?, category = ?, image_url = ?, image_id = ?, icon_class = ?, is_published = ?, published_date = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
        [title, excerpt || null, content, author || null, read_time || null, category || null, image_url || null, image_id || null, icon_class || null, is_published ? 1 : 0, is_published ? new Date() : null, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: "Blog article not found" });
      }
      res.json({ success: true, message: "Blog article updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update blog article" });
    }
  });

  // ---- DELETE blog article (soft delete: hides it from GET / and GET /:id) ----
  router.delete("/:id", async (req, res) => {
    try {
      const [result] = await db.query(
        "UPDATE blog_articles SET deleted_at = NOW() WHERE id = ?",
        [req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: "Blog article not found" });
      }
      res.json({ success: true, message: "Blog article deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete blog article" });
    }
  });

  return router;
}