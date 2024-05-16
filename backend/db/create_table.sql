CREATE TABLE TodoItem (
    TodoID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Description TEXT,
    DueDate DATETIME,
    Priority ENUM('Low', 'Medium', 'High'),
    Status ENUM('Pending', 'Completed', 'Archived') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_User FOREIGN KEY (UserID) REFERENCES User(UserID)
)

CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE shared_todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    todo_id INT,
    room_id VARCHAR(255),
    user_id INT,
    from_user_id INT,
    FOREIGN KEY (todo_id) REFERENCES todo.todoitem(TodoID),
    FOREIGN KEY (user_id) REFERENCES todo.user(UserID)
)