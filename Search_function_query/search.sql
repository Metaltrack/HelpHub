DELIMITER $$

CREATE FUNCTION CalculateDistance(
    lat1 DOUBLE,
    lon1 DOUBLE,
    lat2 DOUBLE,
    lon2 DOUBLE
)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    RETURN 6371 * 2 * ASIN(
        SQRT(
            POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
            COS(RADIANS(lat1)) *
            COS(RADIANS(lat2)) *
            POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
        )
    );
END$$

DELIMITER ;