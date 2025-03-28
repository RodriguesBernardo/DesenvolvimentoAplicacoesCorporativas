CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INT PRIMARY KEY,
  language VARCHAR(10) DEFAULT 'pt-BR',
  theme ENUM('light', 'dark') DEFAULT 'dark',
  notification_enabled BOOLEAN DEFAULT TRUE,
  adult_content_filter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type ENUM('WATCHED', 'RATED', 'REVIEWED', 'ADDED_TO_WATCHLIST', 'REMOVED_FROM_WATCHLIST', 'PROFILE_UPDATE') NOT NULL,
  movie_id INT,
  movie_title VARCHAR(255),
  activity_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id INT PRIMARY KEY,
  movies_watched INT DEFAULT 0,
  hours_watched INT DEFAULT 0,
  reviews_count INT DEFAULT 0,
  watchlist_count INT DEFAULT 0,
  favorite_genre VARCHAR(100),
  last_watched_movie VARCHAR(255),
  last_watched_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE watchlist
ADD COLUMN media_type ENUM('movie', 'tv') DEFAULT 'movie',
ADD COLUMN genre_ids JSON DEFAULT NULL;


DELIMITER //
CREATE TRIGGER after_watchlist_insert
AFTER INSERT ON watchlist
FOR EACH ROW
BEGIN
  UPDATE user_stats 
  SET watchlist_count = watchlist_count + 1 
  WHERE user_id = NEW.user_id;
  
  INSERT INTO user_activities (user_id, activity_type, movie_id, movie_title)
  VALUES (NEW.user_id, 'ADDED_TO_WATCHLIST', NEW.movie_id, NEW.title);
END//
DELIMITER ;


INSERT INTO user_stats (user_id)
SELECT id FROM users
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO user_preferences (user_id)
SELECT id FROM users
ON DUPLICATE KEY UPDATE user_id = user_id;

CREATE VIEW user_profiles AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.avatar,
  u.banner,
  u.created_at,
  s.movies_watched,
  s.hours_watched,
  s.watchlist_count,
  s.favorite_genre,
  p.language,
  p.theme
FROM 
  users u
LEFT JOIN 
  user_stats s ON u.id = s.user_id
LEFT JOIN 
  user_preferences p ON u.id = p.user_id;

  DELIMITER //
CREATE PROCEDURE update_user_stats(IN user_id_param INT)
BEGIN
  DECLARE watched_count INT;
  DECLARE watchlist_count INT;
  
  SELECT COUNT(*) INTO watched_count 
  FROM user_activities 
  WHERE user_id = user_id_param AND activity_type = 'WATCHED';
  
  SELECT COUNT(*) INTO watchlist_count
  FROM watchlist
  WHERE user_id = user_id_param;
  
  UPDATE user_stats
  SET 
    movies_watched = watched_count,
    watchlist_count = watchlist_count,
    last_updated = CURRENT_TIMESTAMP
  WHERE user_id = user_id_param;
END//
DELIMITER ;


ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL;