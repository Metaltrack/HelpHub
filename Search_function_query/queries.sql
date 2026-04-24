TRUNCATE TABLE provider_table;
TRUNCATE TABLE ratings_table;
TRUNCATE TABLE service_request;
TRUNCATE TABLE service_table;
TRUNCATE TABLE test_table;
TRUNCATE TABLE user_table;
TRUNCATE TABLE workerservice;

DELETE FROM service_table WHERE id>0;
DELETE FROM provider_table WHERE id>0;
DELETE FROM user_table WHERE user_id>0;

SELECT * FROM provider_table;

DESC provider_table;
DESC service_table;
DESC workerservice;
DESC service_request;
DESC user_table;

ALTER TABLE provider_table AUTO_INCREMENT = 1;

CREATE TABLE requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    provider_id INT,
    
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),

    description VARCHAR(256),
    address VARCHAR(255),

    location_lat FLOAT,
    location_lon FLOAT,

    budget FLOAT,
    urgency VARCHAR(20), -- low, medium, high

    status VARCHAR(45) DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM service_table;
SELECT * FROM workerservice;
SELECT * FROM user_table;

INSERT INTO service_table(service_type) VALUES 
("Electrician"),
("Plumber"),
("Maid"),
("Vehicle Service"),
("Carpenter"),
("Painter");
