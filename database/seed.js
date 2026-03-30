const bcrypt = require('bcryptjs');
const { db, User, Task } = require('./setup');

async function seedDatabase() {
  try {
    await db.sync({ force: true });
    console.log('Database reset successfully.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      { name: 'John Doe', email: 'john@example.com', password: hashedPassword },
      { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword },
      { name: 'Mike Johnson', email: 'mike@example.com', password: hashedPassword }
    ]);

    await Task.bulkCreate([
      { title: 'Complete project documentation', description: 'Write comprehensive documentation', priority: 'high', completed: false, userId: users[0].id },
      { title: 'Review code changes', description: 'Review pull requests', priority: 'medium', completed: true, userId: users[0].id },
      { title: 'Design new user interface', description: 'Create dashboard mockups', priority: 'high', completed: false, userId: users[1].id },
      { title: 'Database optimization', description: 'Optimize queries', priority: 'medium', completed: false, userId: users[2].id }
    ]);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await db.close();
  }
}

seedDatabase();