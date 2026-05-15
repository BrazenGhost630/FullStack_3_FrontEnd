// Web-compatible SQLite implementation using localStorage
// This is a fallback for web debugging when expo-sqlite doesn't work

interface WebSQLDatabase {
  execAsync: (sql: string) => Promise<any>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  getFirstAsync: (sql: string, params?: any[]) => Promise<any>;
  getAllAsync: (sql: string, params?: any[]) => Promise<any[]>;
}

class WebSQLite implements WebSQLDatabase {
  private dbName: string;
  private storage: { [key: string]: string } = {};
  
  constructor(dbName: string) {
    this.dbName = dbName;
    this.initTables();
  }
  
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  private setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      this.storage[key] = value;
    }
  }
  
  private getItem(key: string): string {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key) || '[]';
    } else {
      return this.storage[key] || '[]';
    }
  }
  
  private initTables() {
    const tables = this.getItem(`${this.dbName}_tables`);
    if (tables === '[]') {
      this.setItem(`${this.dbName}_tables`, JSON.stringify({
        prendas: []
      }));
    }
  }
  
  private executeSQL(sql: string, params?: any[]): any {
    const lowerSQL = sql.toLowerCase().trim();
    
    // Handle CREATE TABLE
    if (lowerSQL.startsWith('create table') || lowerSQL.startsWith('drop table')) {
      return { insertId: 1, rowsAffected: 0 };
    }
    
    // Handle INSERT
    if (lowerSQL.startsWith('insert')) {
      const tableMatch = sql.match(/insert into (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const currentData = JSON.parse(this.getItem(`${this.dbName}_${tableName}`));
        const newId = currentData.length + 1;
        currentData.push({ id: newId, ...params });
        this.setItem(`${this.dbName}_${tableName}`, JSON.stringify(currentData));
        return { insertId: newId, rowsAffected: 1 };
      }
    }
    
    // Handle SELECT
    if (lowerSQL.startsWith('select')) {
      const tableMatch = sql.match(/from (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const data = JSON.parse(this.getItem(`${this.dbName}_${tableName}`));
        return { rows: { _array: data } };
      }
    }
    
    // Handle DELETE
    if (lowerSQL.startsWith('delete')) {
      const tableMatch = sql.match(/from (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        this.setItem(`${this.dbName}_${tableName}`, JSON.stringify([]));
        return { rowsAffected: 1 };
      }
    }
    
    return { rowsAffected: 0 };
  }
  
  async execAsync(sql: string): Promise<any> {
    return this.executeSQL(sql);
  }
  
  async runAsync(sql: string, params?: any[]): Promise<any> {
    return this.executeSQL(sql, params);
  }
  
  async getFirstAsync(sql: string, params?: any[]): Promise<any> {
    const result = this.executeSQL(sql, params);
    return result.rows?._array?.[0] || null;
  }
  
  async getAllAsync(sql: string, params?: any[]): Promise<any[]> {
    const result = this.executeSQL(sql, params);
    return result.rows?._array || [];
  }
}

const openDatabaseAsync = async (dbName: string): Promise<WebSQLDatabase> => {
  return new WebSQLite(dbName);
};

export { openDatabaseAsync };
