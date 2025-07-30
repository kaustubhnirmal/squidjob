#!/usr/bin/env php
<?php
/**
 * Migration CLI Tool
 * SquidJob Tender Management System
 * 
 * Command-line interface for database migrations
 */

// Include bootstrap
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/app/core/MigrationManager.php';

// CLI colors
class CliColors {
    public static $colors = [
        'red' => "\033[31m",
        'green' => "\033[32m",
        'yellow' => "\033[33m",
        'blue' => "\033[34m",
        'magenta' => "\033[35m",
        'cyan' => "\033[36m",
        'white' => "\033[37m",
        'reset' => "\033[0m"
    ];
    
    public static function colorize($text, $color) {
        return self::$colors[$color] . $text . self::$colors['reset'];
    }
}

function showHelp() {
    echo CliColors::colorize("SquidJob Migration Tool\n", 'cyan');
    echo CliColors::colorize("======================\n\n", 'cyan');
    
    echo "Usage: php migrate.php [command] [options]\n\n";
    
    echo CliColors::colorize("Available Commands:\n", 'yellow');
    echo "  migrate              Run pending migrations\n";
    echo "  migrate:rollback     Rollback migrations (default: 1 step)\n";
    echo "  migrate:status       Show migration status\n";
    echo "  migrate:fresh        Drop all tables and re-run migrations\n";
    echo "  migrate:reset        Rollback all migrations\n";
    echo "  make:migration       Create a new migration file\n";
    echo "  db:seed              Run database seeders\n";
    echo "  help                 Show this help message\n\n";
    
    echo CliColors::colorize("Options:\n", 'yellow');
    echo "  --steps=N            Number of steps for rollback (default: 1)\n";
    echo "  --target=MIGRATION   Target migration for migrate command\n";
    echo "  --type=TYPE          Migration type: table, alter, data (default: table)\n";
    echo "  --seeder=NAME        Specific seeder to run\n\n";
    
    echo CliColors::colorize("Examples:\n", 'yellow');
    echo "  php migrate.php migrate\n";
    echo "  php migrate.php migrate:rollback --steps=3\n";
    echo "  php migrate.php make:migration create_users_table\n";
    echo "  php migrate.php make:migration add_email_to_users --type=alter\n";
    echo "  php migrate.php db:seed --seeder=UserSeeder\n\n";
}

function parseArguments($argv) {
    $args = [
        'command' => $argv[1] ?? 'help',
        'options' => []
    ];
    
    for ($i = 2; $i < count($argv); $i++) {
        if (strpos($argv[$i], '--') === 0) {
            $option = substr($argv[$i], 2);
            if (strpos($option, '=') !== false) {
                list($key, $value) = explode('=', $option, 2);
                $args['options'][$key] = $value;
            } else {
                $args['options'][$option] = true;
            }
        } else {
            $args['options']['name'] = $argv[$i];
        }
    }
    
    return $args;
}

function main($argv) {
    $args = parseArguments($argv);
    $command = $args['command'];
    $options = $args['options'];
    
    try {
        $migrationManager = new MigrationManager();
        
        switch ($command) {
            case 'migrate':
                echo CliColors::colorize("Running migrations...\n", 'green');
                $target = $options['target'] ?? null;
                $result = $migrationManager->migrate($target);
                if ($result) {
                    echo CliColors::colorize("✓ Migrations completed successfully!\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Migration failed!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'migrate:rollback':
                $steps = (int)($options['steps'] ?? 1);
                echo CliColors::colorize("Rolling back {$steps} migration(s)...\n", 'yellow');
                $result = $migrationManager->rollback($steps);
                if ($result) {
                    echo CliColors::colorize("✓ Rollback completed successfully!\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Rollback failed!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'migrate:status':
                echo CliColors::colorize("Migration Status\n", 'cyan');
                $migrationManager->status();
                break;
                
            case 'migrate:fresh':
                echo CliColors::colorize("Fresh migration (WARNING: This will drop all tables!)\n", 'red');
                $result = $migrationManager->fresh();
                if ($result) {
                    echo CliColors::colorize("✓ Fresh migration completed!\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Fresh migration failed!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'migrate:reset':
                echo CliColors::colorize("Resetting all migrations...\n", 'yellow');
                // Get all executed migrations and rollback
                $allMigrations = 1000; // Large number to rollback all
                $result = $migrationManager->rollback($allMigrations);
                if ($result) {
                    echo CliColors::colorize("✓ All migrations rolled back!\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Reset failed!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'make:migration':
                if (!isset($options['name'])) {
                    echo CliColors::colorize("Error: Migration name is required!\n", 'red');
                    echo "Usage: php migrate.php make:migration migration_name\n";
                    exit(1);
                }
                
                $type = $options['type'] ?? 'table';
                $filename = $migrationManager->createMigration($options['name'], $type);
                if ($filename) {
                    echo CliColors::colorize("✓ Migration created: {$filename}\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Failed to create migration!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'db:seed':
                echo CliColors::colorize("Running database seeders...\n", 'green');
                $seeder = $options['seeder'] ?? null;
                $result = $migrationManager->seed($seeder);
                if ($result) {
                    echo CliColors::colorize("✓ Seeding completed!\n", 'green');
                } else {
                    echo CliColors::colorize("✗ Seeding failed!\n", 'red');
                    exit(1);
                }
                break;
                
            case 'help':
            default:
                showHelp();
                break;
        }
        
    } catch (Exception $e) {
        echo CliColors::colorize("Error: " . $e->getMessage() . "\n", 'red');
        exit(1);
    }
}

// Check if running from command line
if (php_sapi_name() !== 'cli') {
    echo "This script must be run from the command line.\n";
    exit(1);
}

// Run the main function
main($argv);