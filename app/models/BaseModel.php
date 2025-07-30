<?php
/**
 * Base Model
 * SquidJob Tender Management System
 * 
 * Base model class that all other models extend
 */

namespace App\Models;

use PDO;
use PDOException;

abstract class BaseModel {
    
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $timestamps = true;
    protected $softDeletes = false;
    protected $connection;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->connection = getDbConnection();
    }
    
    /**
     * Find record by ID
     */
    public function find($id) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
            
            if ($this->softDeletes) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Find record by ID or fail
     */
    public function findOrFail($id) {
        $record = $this->find($id);
        
        if (!$record) {
            throw new \Exception("Record not found in {$this->table} with ID: {$id}");
        }
        
        return $record;
    }
    
    /**
     * Find first record matching conditions
     */
    public function where($column, $operator = '=', $value = null) {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }
        
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$column} {$operator} ?";
            
            if ($this->softDeletes) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$value]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get all records matching conditions
     */
    public function whereAll($column, $operator = '=', $value = null) {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }
        
        try {
            $sql = "SELECT * FROM {$this->table} WHERE {$column} {$operator} ?";
            
            if ($this->softDeletes) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$value]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get all records
     */
    public function all($orderBy = null, $direction = 'ASC') {
        try {
            $sql = "SELECT * FROM {$this->table}";
            
            if ($this->softDeletes) {
                $sql .= " WHERE deleted_at IS NULL";
            }
            
            if ($orderBy) {
                $sql .= " ORDER BY {$orderBy} {$direction}";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Create new record
     */
    public function create($data) {
        try {
            // Filter data based on fillable fields
            $data = $this->filterFillable($data);
            
            // Add timestamps
            if ($this->timestamps) {
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
            }
            
            $columns = array_keys($data);
            $placeholders = array_fill(0, count($columns), '?');
            
            $sql = "INSERT INTO {$this->table} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute(array_values($data));
            
            $id = $this->connection->lastInsertId();
            return $this->find($id);
        } catch (PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Update record
     */
    public function update($id, $data) {
        try {
            // Filter data based on fillable fields
            $data = $this->filterFillable($data);
            
            // Add updated timestamp
            if ($this->timestamps) {
                $data['updated_at'] = date('Y-m-d H:i:s');
            }
            
            $columns = array_keys($data);
            $setClause = implode(' = ?, ', $columns) . ' = ?';
            
            $sql = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";
            
            $values = array_values($data);
            $values[] = $id;
            
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->execute($values);
            
            if ($result) {
                return $this->find($id);
            }
            
            return null;
        } catch (PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Delete record
     */
    public function delete($id) {
        try {
            if ($this->softDeletes) {
                // Soft delete
                $sql = "UPDATE {$this->table} SET deleted_at = ?, deleted_by = ? WHERE {$this->primaryKey} = ?";
                $stmt = $this->connection->prepare($sql);
                return $stmt->execute([
                    date('Y-m-d H:i:s'),
                    auth() ? user()['id'] : null,
                    $id
                ]);
            } else {
                // Hard delete
                $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
                $stmt = $this->connection->prepare($sql);
                return $stmt->execute([$id]);
            }
        } catch (PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Count records
     */
    public function count($column = null, $value = null) {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->table}";
            $params = [];
            
            if ($column && $value !== null) {
                $sql .= " WHERE {$column} = ?";
                $params[] = $value;
            }
            
            if ($this->softDeletes) {
                $sql .= ($column ? " AND" : " WHERE") . " deleted_at IS NULL";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['count'];
        } catch (PDOException $e) {
            $this->handleError($e);
            return 0;
        }
    }
    
    /**
     * Paginate records
     */
    public function paginate($page = 1, $perPage = 20, $orderBy = null, $direction = 'ASC') {
        try {
            $offset = ($page - 1) * $perPage;
            
            // Get total count
            $total = $this->count();
            
            // Get records
            $sql = "SELECT * FROM {$this->table}";
            
            if ($this->softDeletes) {
                $sql .= " WHERE deleted_at IS NULL";
            }
            
            if ($orderBy) {
                $sql .= " ORDER BY {$orderBy} {$direction}";
            }
            
            $sql .= " LIMIT {$perPage} OFFSET {$offset}";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'data' => $data,
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total)
            ];
        } catch (PDOException $e) {
            $this->handleError($e);
            return [
                'data' => [],
                'current_page' => 1,
                'per_page' => $perPage,
                'total' => 0,
                'last_page' => 1,
                'from' => 0,
                'to' => 0
            ];
        }
    }
    
    /**
     * Search records
     */
    public function search($query, $columns = []) {
        try {
            if (empty($columns)) {
                $columns = ['*'];
            }
            
            $searchColumns = is_array($columns) ? $columns : [$columns];
            $whereConditions = [];
            $params = [];
            
            foreach ($searchColumns as $column) {
                $whereConditions[] = "{$column} LIKE ?";
                $params[] = "%{$query}%";
            }
            
            $sql = "SELECT * FROM {$this->table} WHERE " . implode(' OR ', $whereConditions);
            
            if ($this->softDeletes) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Execute raw SQL query
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollback();
    }
    
    /**
     * Filter data based on fillable fields
     */
    protected function filterFillable($data) {
        if (empty($this->fillable)) {
            // If no fillable fields specified, remove guarded fields
            return array_diff_key($data, array_flip($this->guarded));
        }
        
        // Only allow fillable fields
        return array_intersect_key($data, array_flip($this->fillable));
    }
    
    /**
     * Handle database errors
     */
    protected function handleError(PDOException $e) {
        $message = "Database Error in {$this->table}: " . $e->getMessage();
        error_log($message);
        
        if (config('app.debug')) {
            throw $e;
        }
    }
    
    /**
     * Get table name
     */
    public function getTable() {
        return $this->table;
    }
    
    /**
     * Set table name
     */
    public function setTable($table) {
        $this->table = $table;
        return $this;
    }
    
    /**
     * Get primary key
     */
    public function getPrimaryKey() {
        return $this->primaryKey;
    }
    
    /**
     * Check if record exists
     */
    public function exists($id) {
        return $this->find($id) !== null;
    }
    
    /**
     * Get first record
     */
    public function first($orderBy = null, $direction = 'ASC') {
        try {
            $sql = "SELECT * FROM {$this->table}";
            
            if ($this->softDeletes) {
                $sql .= " WHERE deleted_at IS NULL";
            }
            
            if ($orderBy) {
                $sql .= " ORDER BY {$orderBy} {$direction}";
            }
            
            $sql .= " LIMIT 1";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get last record
     */
    public function last($orderBy = null) {
        $orderBy = $orderBy ?: $this->primaryKey;
        return $this->first($orderBy, 'DESC');
    }
}