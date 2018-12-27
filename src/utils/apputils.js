import fs               from 'fs';

const manifest = filepath => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    const err = { name: 'NotFound', message: 'Manifest file not found.' };
    throw new Error(err);
  }
}

export default { manifest };
