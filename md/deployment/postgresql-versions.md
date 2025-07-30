# PostgreSQL Version Compatibility Guide

## Supported PostgreSQL Versions

### For AlmaLinux 9 Deployment

#### ✅ Recommended: PostgreSQL 13
- **Stability**: Mature and stable release
- **Features**: Full JSONB support, advanced indexing
- **Compatibility**: Perfect for AlmaLinux 9
- **Support**: Long-term support until 2026

#### ✅ Alternative: PostgreSQL 12  
- **Stability**: Very stable, production-ready
- **Features**: JSONB, arrays, all core features supported
- **Compatibility**: Excellent on AlmaLinux 9
- **Support**: Extended support available

#### ✅ Advanced: PostgreSQL 14
- **Features**: Enhanced performance, multirange types
- **Compatibility**: Good on AlmaLinux 9
- **Performance**: Better query optimization

## Current Application Features vs PostgreSQL Versions

| Feature | PG 12 | PG 13 | PG 14 | PG 15+ |
|---------|-------|-------|-------|--------|
| JSONB Support | ✅ | ✅ | ✅ | ✅ |
| Array Types | ✅ | ✅ | ✅ | ✅ |
| Timestamps | ✅ | ✅ | ✅ | ✅ |
| Serial Types | ✅ | ✅ | ✅ | ✅ |
| Text Search | ✅ | ✅ | ✅ | ✅ |
| Indexes | ✅ | ✅ | ✅ | ✅ |
| Drizzle ORM | ✅ | ✅ | ✅ | ✅ |

## Deployment Options

### Option 1: Local PostgreSQL (Recommended)
```bash
# Run the setup script
./deployment/almalinux-setup.sh

# Update DATABASE_URL
DATABASE_URL=postgresql://tender247_user:password@localhost:5432/tender247
```

### Option 2: Continue with Neon Database
```bash
# Keep current DATABASE_URL
# Application will work with PostgreSQL 15+ on Neon
```

### Option 3: Dockerized PostgreSQL
```bash
# Use Docker with specific PostgreSQL version
docker run -d \
  --name postgres13 \
  -e POSTGRES_DB=tender247 \
  -e POSTGRES_USER=tender247_user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13

DATABASE_URL=postgresql://tender247_user:password@localhost:5432/tender247
```

## Performance Considerations

### PostgreSQL 12
- **Memory Usage**: Lower baseline memory usage
- **Query Performance**: Good for most operations
- **Maintenance**: Well-established maintenance procedures

### PostgreSQL 13
- **Vacuum Improvements**: Better autovacuum performance
- **Indexing**: Enhanced B-tree index performance  
- **Partitioning**: Improved partition-wise joins

### PostgreSQL 14
- **Query Planning**: Better optimization for complex queries
- **Connection Pooling**: Improved connection handling
- **JSON Performance**: Enhanced JSONB operations

## Migration Path

If you need to downgrade from current Neon setup:

1. **Export data from Neon**:
   ```bash
   pg_dump $NEON_DATABASE_URL > tender247_backup.sql
   ```

2. **Set up local PostgreSQL**:
   ```bash
   ./deployment/almalinux-setup.sh
   ```

3. **Import data to local PostgreSQL**:
   ```bash
   psql -h localhost -U tender247_user -d tender247 < tender247_backup.sql
   ```

4. **Update environment**:
   ```bash
   # Update .env
   DATABASE_URL=postgresql://tender247_user:password@localhost:5432/tender247
   ```

5. **Test application**:
   ```bash
   npm run dev
   ```

## Troubleshooting Common Issues

### Connection Timeouts
- Increase `connectionTimeoutMillis` to 30000+
- Check network connectivity between app and database

### SSL Issues  
- For local PostgreSQL, set SSL to false
- For remote PostgreSQL, ensure SSL certificates are valid

### Performance Issues
- Monitor connection pool usage
- Adjust `max` connections based on server capacity
- Consider connection pooling with PgBouncer

### Version-Specific Issues
- Check PostgreSQL logs: `/var/lib/pgsql/13/data/log/`
- Verify installed extensions match application requirements
- Update Drizzle configuration if needed