CREATE TABLE Todos (
    TodoID INT AUTO_INCREMENT PRIMARY KEY,
    Description TEXT,
    DueDate DATETIME,
    Priority ENUM('Low', 'Medium', 'High'),
    Status ENUM('Pending', 'Completed', 'Archived') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);