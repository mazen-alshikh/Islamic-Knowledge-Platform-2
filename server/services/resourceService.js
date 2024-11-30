import { getDb, tables, query, queryAll, run } from '../config/database.js';
import { validateResourceData } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, unlinkSync } from 'fs';

export class ResourceService {
  static async getAll() {
    return queryAll(`
      SELECT * FROM ${tables.resources} 
      ORDER BY created_at DESC
    `);
  }

  static async create(title, type, content) {
    try {
      let processedContent;
      
      if (typeof content === 'string' && content.includes('uploads/')) {
        // Handle file upload
        try {
          const fileContent = readFileSync(content, 'utf-8');
          processedContent = await validateResourceData(fileContent, type);
        } catch (err) {
          throw new Error(`Invalid file content: ${err.message}`);
        } finally {
          // Clean up uploaded file
          try {
            unlinkSync(content);
          } catch (err) {
            console.error('Failed to clean up uploaded file:', err);
          }
        }
      } else {
        // Handle direct content
        processedContent = content;
      }

      const id = uuidv4();
      const timestamp = new Date().toISOString();

      run(`
        INSERT INTO ${tables.resources} (
          id, 
          title, 
          type, 
          content,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        title,
        type,
        JSON.stringify(processedContent),
        timestamp,
        timestamp
      ]);

      return { id, title, type };
    } catch (error) {
      console.error('Failed to create resource:', error);
      throw new Error(`Failed to create resource: ${error.message}`);
    }
  }

  static async delete(id) {
    return run(`
      DELETE FROM ${tables.resources} 
      WHERE id = ?
    `, [id]);
  }
}