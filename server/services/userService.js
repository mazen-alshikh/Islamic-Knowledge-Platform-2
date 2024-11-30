import { getDb, tables, query, run } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  static async findByEmail(email) {
    return query(`SELECT * FROM ${tables.users} WHERE email = ?`, [email]);
  }

  static async verifyPassword(hashedPassword, plainPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async createUser(email, password, role = 'user') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = uuidv4();

    run(`
      INSERT INTO ${tables.users} (id, email, password, role)
      VALUES (?, ?, ?, ?)
    `, [id, email, hashedPassword, role]);

    return { id, email, role };
  }
}