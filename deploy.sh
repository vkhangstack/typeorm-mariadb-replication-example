#!/bin/bash

# Start the Docker containers
echo "Starting Docker containers..."
docker compose up -d

# Wait for the master to be ready
echo "Waiting for master to initialize..."
sleep 1

# Set up the master
echo "Setting up master..."
docker exec -i mariadb-master mariadb -uroot -prootpassword -e "DROP USER 'repluser'@'%';"
docker exec -i mariadb-master mariadb -uroot -prootpassword <<EOF
CREATE USER 'repluser'@'%' IDENTIFIED BY 'replpassword';
GRANT REPLICATION SLAVE ON *.* TO 'repluser'@'%';
FLUSH PRIVILEGES;
SHOW MASTER STATUS\G
EOF



# Fetch the master log file and position
MASTER_STATUS=$(docker exec -i mariadb-master mariadb -uroot -prootpassword -e "SHOW MASTER STATUS\G")
LOG_FILE=$(echo "$MASTER_STATUS" | grep "File:" | awk '{print $2}')
LOG_POS=$(echo "$MASTER_STATUS" | grep "Position:" | awk '{print $2}')

# Configure the slave
echo "Setting up slave with LOG_FILE=$LOG_FILE and LOG_POS=$LOG_POS..."
# docker exec -it mariadb-slave mariadb -uroot -prootpassword -e "DROP USER 'repluser'@'%';"
docker exec -i mariadb-slave mariadb -uroot -prootpassword <<EOF
STOP SLAVE;
CHANGE MASTER TO
    MASTER_HOST='mariadb-master',
    MASTER_USER='repluser',
    MASTER_PASSWORD='replpassword',
    MASTER_LOG_FILE='$LOG_FILE',
    MASTER_LOG_POS=$LOG_POS;
START SLAVE;
EOF

docker exec -i mariadb-master mariadb -uroot -prootpassword <<EOF
create table if not exists exampledb.users
(
    id   varchar(36) primary key not null,
    name text
);
EOF
docker exec -i mariadb-slave mariadb -uroot -prootpassword -e "SHOW SLAVE STATUS\G"
echo "Replication setup completed."
