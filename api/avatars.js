import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  const { avatar } = req.query;
  
  if (!avatar) {
    return res.status(400).json({ error: 'Avatar filename required' });
  }
  
  // Caminho para o diretório de avatares
  const avatarPath = path.join(__dirname, '../public/avatars', avatar);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(avatarPath)) {
    return res.status(404).json({ error: 'Avatar not found' });
  }
  
  // Determinar o tipo de conteúdo baseado na extensão
  const ext = path.extname(avatar).toLowerCase();
  let contentType = 'image/jpeg';
  
  switch (ext) {
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.webp':
      contentType = 'image/webp';
      break;
  }
  
  // Configurar cabeçalhos
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
  
  // Servir o arquivo
  const fileStream = fs.createReadStream(avatarPath);
  fileStream.pipe(res);
}