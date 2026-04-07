set -a
source ../.env
set +a

export FLYWAY_URL=jdbc:mariadb://localhost:3306/$DB_NAME
export FLYWAY_USER=$DB_USER
export FLYWAY_PASSWORD=$DB_PASS
export FLYWAY_LOCATIONS=filesystem:./migrations

flyway migrate