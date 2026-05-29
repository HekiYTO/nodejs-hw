import mongoose from 'mongoose';
import 'dotenv/config';
import { Note } from './src/models/note.js';
import fs from 'fs';

const notesData = JSON.parse(fs.readFileSync('./notes.json', 'utf-8'));

const importNotes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Очистити колекцію перед імпортом
    await Note.deleteMany({});
    console.log('🗑️ Cleared existing notes');

    // Імпортувати нові дані
    const result = await Note.insertMany(notesData);
    console.log(`✅ Imported ${result.length} notes`);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

importNotes();
