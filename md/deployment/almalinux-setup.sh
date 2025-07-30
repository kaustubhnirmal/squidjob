#!/bin/bash

# Tender247 PostgreSQL Setup Script for AlmaLinux 9
# This script sets up PostgreSQL 13 (recommended for AlmaLinux 9)

set -e  # Exit on any error

echo "🚀 Starting PostgreSQL setup for AlmaLinux 9..."

# Check if running on AlmaLinux
if ! grep -q "AlmaLinux" /etc/os-release; then
    echo "⚠️  Warning: This script is designed for AlmaLinux 9"
    read -p "Continue anyway? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install PostgreSQL 13 repository
echo "📥 Adding PostgreSQL repository..."
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL 13
echo "🐘 Installing PostgreSQL 13..."
sudo dnf install -y postgresql13-server postgresql13-contrib

# Initialize database
echo "🔧 Initializing PostgreSQL database..."
if [ ! -f /var/lib/pgsql/13/data/postgresql.conf ]; then
    sudo /usr/pgsql-13/bin/postgresql-13-setup initdb
else
    echo "Database already initialized, skipping..."
fi

# Enable and start PostgreSQL
echo "🚀 Starting PostgreSQL service..."
sudo systemctl enable postgresql-13
sudo systemctl start postgresql-13

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Get database password
echo "🔐 Setting up database and user..."
read -s -p "Enter password for tender247_user: " DB_PASS
echo

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE tender247;
CREATE USER tender247_user WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE tender247 TO tender247_user;
ALTER USER tender247_user CREATEDB;
\q
EOF

# Configure PostgreSQL for local connections
echo "⚙️  Configuring PostgreSQL..."
PG_HBA_FILE="/var/lib/pgsql/13/data/pg_hba.conf"
PG_CONF_FILE="/var/lib/pgsql/13/data/postgresql.conf"

# Backup original pg_hba.conf
sudo cp $PG_HBA_FILE $PG_HBA_FILE.backup

# Update pg_hba.conf for local connections
sudo sed -i "s/#local   all             all                                     peer/local   all             all                                     md5/" $PG_HBA_FILE
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" $PG_HBA_FILE

# Update postgresql.conf for better performance
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" $PG_CONF_FILE
sudo sed -i "s/#max_connections = 100/max_connections = 200/" $PG_CONF_FILE
sudo sed -i "s/#shared_buffers = 128MB/shared_buffers = 256MB/" $PG_CONF_FILE

# Restart PostgreSQL to apply configuration changes
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql-13

# Configure firewall if firewalld is running
if systemctl is-active --quiet firewalld; then
    echo "🔥 Configuring firewall..."
    sudo firewall-cmd --permanent --add-service=postgresql
    sudo firewall-cmd --reload
fi

# Test database connection
echo "🧪 Testing database connection..."
if PGPASSWORD=$DB_PASS psql -h localhost -U tender247_user -d tender247 -c "SELECT version();"; then
    echo "✅ PostgreSQL setup completed successfully!"
    echo ""
    echo "📝 Database connection details:"
    echo "   Host: localhost"
    echo "   Port: 5432"  
    echo "   Database: tender247"
    echo "   User: tender247_user"
    echo "   Password: [hidden]"
    echo ""
    echo "🔗 Your DATABASE_URL should be:"
    echo "   DATABASE_URL=postgresql://tender247_user:$DB_PASS@localhost:5432/tender247"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Copy the DATABASE_URL to your .env file"
    echo "   2. Run 'npm run db:push' to create database schema"
    echo "   3. Start your application with 'npm run dev'"
else
    echo "❌ Database connection test failed!"
    echo "Please check the PostgreSQL installation and try again."
    exit 1
fi