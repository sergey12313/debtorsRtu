-- Up
--DROP TABLE deb
CREATE TABLE deb(id INT PRIMARY KEY,groups TEXT,capacity INT);

INSERT INTO deb (id,groups,capacity) VALUES ('11111112', 'ssdfgdsfgdsfg', 1);
INSERT INTO deb (id,groups,capacity) VALUES ('11112132', 'ssdfgdsfgdsfg', 1);
-- Down
DROP TABLE deb;
CREATE TABLE deb(id INT PRIMARY KEY,groups TEXT,capacity INT,found INT DEFAULT 1);