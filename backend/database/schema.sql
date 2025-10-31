CREATE DATABASE IF NOT EXISTS slotswapper;
USE slotswapper;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_available_for_swap BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_time (user_id, start_time),
    INDEX idx_start_time (start_time),
    INDEX idx_available (is_available_for_swap)
);

CREATE TABLE swap_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    requester_slot_id INT NOT NULL,
    target_user_id INT NOT NULL,
    target_slot_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    INDEX idx_requester (requester_id),
    INDEX idx_target_user (target_user_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_swap_request (requester_slot_id, target_slot_id)
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('swap_request', 'swap_approved', 'swap_rejected', 'swap_cancelled') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_swap_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_swap_id) REFERENCES swap_requests(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at)
);

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@slotswapper.com', '$2a$10$rOzJqBkqFJbj8LrPcRDqBuVIIeqgw8JhqfJZH8eEJoE8eJhJh8eE.', 'Admin', 'User', 'admin');

INSERT INTO users (email, password_hash, first_name, last_name) VALUES 
('rajesh.kumar@example.com', '$2a$10$rOzJqBkqFJbj8LrPcRDqBuVIIeqgw8JhqfJZH8eEJoE8eJhJh8eE.', 'Rajesh', 'Kumar'),
('priya.sharma@example.com', '$2a$10$rOzJqBkqFJbj8LrPcRDqBuVIIeqgw8JhqfJZH8eEJoE8eJhJh8eE.', 'Priya', 'Sharma'),
('amit.patel@example.com', '$2a$10$rOzJqBkqFJbj8LrPcRDqBuVIIeqgw8JhqfJZH8eEJoE8eJhJh8eE.', 'Amit', 'Patel');