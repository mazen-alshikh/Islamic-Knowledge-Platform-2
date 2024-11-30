import { readFileSync } from 'fs';

export async function validateResourceData(content, type) {
  let data;
  
  try {
    if (typeof content === 'string') {
      data = JSON.parse(content);
    } else {
      data = content;
    }
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  const validators = {
    quran: validateQuranEntry,
    hadith: validateHadithEntry,
    tafsir: validateTafsirEntry,
    fiqh: validateFiqhEntry
  };

  const validator = validators[type];
  if (!validator) {
    throw new Error('Invalid resource type');
  }

  data.forEach(validator);
  return data;
}

function validateQuranEntry(entry) {
  const required = ['chapter', 'verse', 'text'];
  validateRequiredFields(entry, required);
}

function validateHadithEntry(entry) {
  const required = ['book', 'number', 'text'];
  validateRequiredFields(entry, required);
}

function validateTafsirEntry(entry) {
  const required = ['chapter', 'verse', 'text'];
  validateRequiredFields(entry, required);
}

function validateFiqhEntry(entry) {
  const required = ['topic', 'text'];
  validateRequiredFields(entry, required);
}

function validateRequiredFields(entry, required) {
  const missing = required.filter(field => !entry[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}